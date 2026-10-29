import time
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.document import Document
from app.schemas.query import QueryRequest, QueryResponse
from app.services.rag_graph import rag_agent_graph
from app.services.observability import LangfuseService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/query", tags=["RAG Query"])

@router.post("", response_model=QueryResponse)
async def query_knowledge_source(
    payload: QueryRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """
    Executes LangGraph RAG Agent Workflow across ingested knowledge sources (PDF, Web, YouTube, Text):
    1. Input Guard Node: Sanitization & injection screening
    2. Retrieval Node: Sub-second pgvector cosine distance search
    3. Grade Node: Sufficiency check to prevent hallucination
    4. Generation Node: Groq & Gemini Dual Engine with automatic mutual failover
    5. Output Guard Node: Verbatim citation mapping & abstention enforcement
    All execution steps, latencies, and token usage are traced via Langfuse.
    """
    start_time = time.time()

    # Verify document exists and belongs to user
    stmt = select(Document).where(Document.id == payload.document_id, Document.user_id == user_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied."
        )

    if doc.status != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document is not ready for querying. Current status: {doc.status}"
        )

    # Initialize top-level Langfuse Trace
    trace = LangfuseService.create_rag_trace(
        name="LangGraph RAG Query Execution",
        user_id=user_id,
        query=payload.query,
        document_id=str(payload.document_id),
        metadata={
            "source_type": doc.source_type,
            "original_name": doc.original_name,
            "git_commit_hash": doc.git_commit_hash,
            "chunk_count": doc.chunk_count,
            "top_k": payload.top_k or 5
        }
    )

    # Initial state for LangGraph workflow
    initial_state = {
        "query": payload.query,
        "document_id": str(payload.document_id),
        "user_id": user_id,
        "top_k": payload.top_k or 5,
        "db_session": db,
        "is_safe": True,
        "input_rejection_reason": None,
        "citations": [],
        "raw_answer": "",
        "final_answer": "",
        "abstained": False,
        "abstention_reason": None,
        "verified_citations": [],
        "latency_ms": 0.0,
        "langfuse_trace": trace,
        "preferred_provider": payload.preferred_provider,
        "llm_provider": None,
        "llm_model": None
    }

    try:
        # Run compiled LangGraph state machine asynchronously
        graph_output = await rag_agent_graph.ainvoke(initial_state)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return QueryResponse(
            document_id=payload.document_id,
            query=payload.query,
            answer=graph_output.get("final_answer", ""),
            abstained=graph_output.get("abstained", False),
            abstention_reason=graph_output.get("abstention_reason"),
            citations=graph_output.get("verified_citations", []),
            latency_ms=elapsed_ms,
            llm_provider=graph_output.get("llm_provider"),
            llm_model=graph_output.get("llm_model")
        )

    except Exception as e:
        logger.exception(f"Error executing LangGraph RAG workflow: {e}")
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return QueryResponse(
            document_id=payload.document_id,
            query=payload.query,
            answer="I am unable to answer this question based on the provided document.",
            abstained=True,
            abstention_reason=f"Pipeline error: {str(e)}",
            citations=[],
            latency_ms=elapsed_ms
        )
    finally:
        LangfuseService.flush()

