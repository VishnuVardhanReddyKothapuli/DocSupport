import time
import logging
from typing import TypedDict, List, Optional, Dict, Any
from langgraph.graph import StateGraph, END

from app.schemas.query import Citation
from app.services.guardrails import DualGuardrailEngine, ABSTENTION_PHRASE
from app.services.retrieval import RetrievalService
from app.services.llm import LLMService
from app.services.observability import LangfuseService

logger = logging.getLogger(__name__)

class RAGGraphState(TypedDict):
    query: str
    document_id: str
    user_id: str
    top_k: int
    db_session: Any
    
    # Workflow State
    is_safe: bool
    input_rejection_reason: Optional[str]
    citations: List[Citation]
    raw_answer: str
    final_answer: str
    abstained: bool
    abstention_reason: Optional[str]
    verified_citations: List[Citation]
    latency_ms: float
    langfuse_trace: Any
    preferred_provider: Optional[str]
    llm_provider: Optional[str]
    llm_model: Optional[str]

async def node_input_guard(state: RAGGraphState) -> Dict[str, Any]:
    """Node 1: Evaluates prompt injection, jailbreaks, and sanitizes input."""
    t0 = time.time()
    is_safe, sanitized_query, reason = DualGuardrailEngine.inspect_input(state["query"])
    elapsed = (time.time() - t0) * 1000

    trace = state.get("langfuse_trace")
    if trace:
        LangfuseService.log_input_guardrail(trace, is_safe, reason, elapsed)

    return {
        "is_safe": is_safe,
        "query": sanitized_query if is_safe else state["query"],
        "input_rejection_reason": reason,
        "abstained": not is_safe,
        "abstention_reason": reason if not is_safe else None
    }

async def node_retrieve(state: RAGGraphState) -> Dict[str, Any]:
    """Node 2: Executes pgvector sub-second cosine distance search."""
    t0 = time.time()
    db = state["db_session"]
    import uuid
    doc_uuid = uuid.UUID(state["document_id"])

    citations = await RetrievalService.search_chunks(
        db=db,
        document_id=doc_uuid,
        query=state["query"],
        top_k=state.get("top_k", 5)
    )
    elapsed = (time.time() - t0) * 1000

    trace = state.get("langfuse_trace")
    if trace:
        LangfuseService.log_retrieval(
            trace=trace,
            top_k=state.get("top_k", 5),
            retrieved_count=len(citations),
            chunks_metadata=[c.model_dump() for c in citations],
            latency_ms=elapsed
        )

    return {"citations": citations}

async def node_grade_retrieval(state: RAGGraphState) -> Dict[str, Any]:
    """Node 3: Evaluates retrieved chunks sufficiency to prevent hallucination."""
    citations = state.get("citations", [])
    if not citations:
        return {
            "abstained": True,
            "abstention_reason": "No chunks met vector cosine similarity relevance threshold.",
            "final_answer": ABSTENTION_PHRASE,
            "verified_citations": []
        }
    return {}

async def node_generate(state: RAGGraphState) -> Dict[str, Any]:
    """Node 4: Generates strictly grounded response using Groq / Gemini with automatic mutual failover."""
    t0 = time.time()
    raw_answer, provider_used, model_used = LLMService.generate_grounded_answer_with_metadata(
        query=state["query"],
        citations=state["citations"],
        temperature=0.1,
        preferred_provider=state.get("preferred_provider")
    )
    elapsed = (time.time() - t0) * 1000

    trace = state.get("langfuse_trace")
    if trace:
        from app.config import settings
        LangfuseService.log_llm_generation(
            trace=trace,
            model=model_used or settings.GROQ_MODEL,
            prompt=state["query"],
            output=raw_answer,
            latency_ms=elapsed,
            provider=provider_used
        )

    return {
        "raw_answer": raw_answer,
        "llm_provider": provider_used,
        "llm_model": model_used
    }

async def node_output_guard(state: RAGGraphState) -> Dict[str, Any]:
    """Node 5: Output Guardrail: checks grounding, verifies citations, prevents hallucinations."""
    is_grounded, abstained, final_answer, verified_citations = DualGuardrailEngine.inspect_output(
        raw_answer=state["raw_answer"],
        citations=state["citations"]
    )

    trace = state.get("langfuse_trace")
    if trace:
        LangfuseService.log_output_guardrail(
            trace=trace,
            is_grounded=is_grounded,
            abstained=abstained,
            citations_count=len(verified_citations),
            abstention_reason=state.get("abstention_reason")
        )

    return {
        "final_answer": final_answer,
        "abstained": abstained,
        "verified_citations": verified_citations,
        "abstention_reason": "Insufficient source evidence in indexed chunks." if abstained else None
    }

async def node_abstain(state: RAGGraphState) -> Dict[str, Any]:
    """Fallback node when input security or retrieval fails."""
    reason = state.get("input_rejection_reason") or state.get("abstention_reason") or "Evidence missing in source document."
    ans = "Your query was rejected by the input security guardrail." if not state.get("is_safe", True) else ABSTENTION_PHRASE
    return {
        "final_answer": ans,
        "abstained": True,
        "abstention_reason": reason,
        "verified_citations": []
    }

# Conditional routing functions
def route_after_input_guard(state: RAGGraphState) -> str:
    if not state.get("is_safe", True):
        return "abstain"
    return "retrieve"

def route_after_grade(state: RAGGraphState) -> str:
    if state.get("abstained", False):
        return "abstain"
    return "generate"

# Build LangGraph Workflow
def build_rag_graph():
    workflow = StateGraph(RAGGraphState)

    # Add Nodes
    workflow.add_node("input_guard", node_input_guard)
    workflow.add_node("retrieve", node_retrieve)
    workflow.add_node("grade_retrieval", node_grade_retrieval)
    workflow.add_node("generate", node_generate)
    workflow.add_node("output_guard", node_output_guard)
    workflow.add_node("abstain", node_abstain)

    # Define Entry Point
    workflow.set_entry_point("input_guard")

    # Add Edges & Conditional Transitions
    workflow.add_conditional_edges(
        "input_guard",
        route_after_input_guard,
        {
            "retrieve": "retrieve",
            "abstain": "abstain"
        }
    )

    workflow.add_edge("retrieve", "grade_retrieval")

    workflow.add_conditional_edges(
        "grade_retrieval",
        route_after_grade,
        {
            "generate": "generate",
            "abstain": "abstain"
        }
    )

    workflow.add_edge("generate", "output_guard")
    workflow.add_edge("output_guard", END)
    workflow.add_edge("abstain", END)

    return workflow.compile()

# Compiled singleton graph
rag_agent_graph = build_rag_graph()
