import logging
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

class NoOpSpan:
    """Fallback no-op span when Langfuse is not configured or in offline mode."""
    def end(self, **kwargs):
        pass
    def span(self, **kwargs):
        return self
    def generation(self, **kwargs):
        return self
    def event(self, **kwargs):
        pass
    def score(self, **kwargs):
        pass

class NoOpTrace:
    """Fallback no-op trace."""
    id = "local-trace"
    def span(self, **kwargs):
        return NoOpSpan()
    def generation(self, **kwargs):
        return NoOpSpan()
    def score(self, **kwargs):
        pass
    def update(self, **kwargs):
        pass

class LangfuseService:
    _client = None

    @classmethod
    def get_client(cls):
        """Lazy initialization of Langfuse client."""
        if cls._client is not None:
            return cls._client

        if not settings.LANGFUSE_ENABLED or not settings.LANGFUSE_PUBLIC_KEY or not settings.LANGFUSE_SECRET_KEY:
            logger.info("Langfuse is not configured with public/secret keys. Operating in no-op mode.")
            return None

        try:
            from langfuse import Langfuse
            cls._client = Langfuse(
                public_key=settings.LANGFUSE_PUBLIC_KEY,
                secret_key=settings.LANGFUSE_SECRET_KEY,
                host=settings.LANGFUSE_HOST
            )
            logger.info(f"Langfuse observability client connected to {settings.LANGFUSE_HOST}")
            return cls._client
        except Exception as e:
            logger.warning(f"Could not initialize Langfuse client: {e}")
            return None

    @classmethod
    def create_rag_trace(
        cls,
        name: str,
        user_id: str,
        query: str,
        document_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Creates a new top-level Langfuse trace for RAG query."""
        client = cls.get_client()
        if not client:
            return NoOpTrace()

        try:
            trace = client.trace(
                name=name,
                user_id=user_id,
                input={"query": query},
                metadata={
                    "document_id": document_id,
                    **(metadata or {})
                },
                tags=["enterprise-rag", "gitloader", settings.ENVIRONMENT]
            )
            return trace
        except Exception as e:
            logger.warning(f"Error creating Langfuse trace: {e}")
            return NoOpTrace()

    @classmethod
    def log_input_guardrail(
        cls,
        trace,
        is_safe: bool,
        rejection_reason: Optional[str],
        latency_ms: float
    ):
        """Logs input guardrail execution span to Langfuse."""
        try:
            span = trace.span(
                name="Input Guardrail",
                input={"query_check": "prompt_injection_sanitization"},
                output={"is_safe": is_safe, "rejection_reason": rejection_reason},
                metadata={"latency_ms": latency_ms}
            )
            trace.score(
                name="input_safety",
                value=1.0 if is_safe else 0.0,
                comment=rejection_reason or "Safe query"
            )
            span.end()
        except Exception as e:
            logger.warning(f"Error logging input guardrail to Langfuse: {e}")

    @classmethod
    def log_retrieval(
        cls,
        trace,
        top_k: int,
        retrieved_count: int,
        chunks_metadata: List[Dict[str, Any]],
        latency_ms: float
    ):
        """Logs vector similarity search span to Langfuse."""
        try:
            span = trace.span(
                name="Vector Retrieval (pgvector)",
                input={"top_k": top_k},
                output={"retrieved_count": retrieved_count, "chunks": chunks_metadata},
                metadata={"engine": "pgvector_hnsw_cosine", "latency_ms": latency_ms}
            )
            span.end()
        except Exception as e:
            logger.warning(f"Error logging retrieval to Langfuse: {e}")

    @classmethod
    def log_llm_generation(
        cls,
        trace,
        model: str,
        prompt: str,
        output: str,
        latency_ms: float
    ):
        """Logs Groq LLM inference generation to Langfuse."""
        try:
            gen = trace.generation(
                name="Groq LLM Generation",
                model=model,
                input=prompt,
                output=output,
                metadata={"temperature": 0.1, "latency_ms": latency_ms}
            )
            gen.end()
        except Exception as e:
            logger.warning(f"Error logging LLM generation to Langfuse: {e}")

    @classmethod
    def log_output_guardrail(
        cls,
        trace,
        is_grounded: bool,
        abstained: bool,
        citations_count: int,
        abstention_reason: Optional[str]
    ):
        """Logs output hallucination prevention span and grounding score to Langfuse."""
        try:
            span = trace.span(
                name="Output Guardrail",
                output={
                    "is_grounded": is_grounded,
                    "abstained": abstained,
                    "citations_count": citations_count,
                    "abstention_reason": abstention_reason
                }
            )
            trace.score(
                name="grounding_verification",
                value=0.0 if abstained else (1.0 if is_grounded else 0.5),
                comment="Abstained due to insufficient evidence" if abstained else "Verified grounded in retrieved chunks"
            )
            span.end()
            trace.update(
                output={"final_answer": "abstained" if abstained else "grounded_response"}
            )
        except Exception as e:
            logger.warning(f"Error logging output guardrail to Langfuse: {e}")
