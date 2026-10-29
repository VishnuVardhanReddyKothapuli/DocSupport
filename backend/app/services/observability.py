import logging
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

class NoOpSpan:
    """Fallback no-op span when Langfuse is not configured or in offline mode."""
    def end(self, **kwargs):
        pass
    def update(self, **kwargs):
        pass
    def start_span(self, **kwargs):
        return self
    def start_observation(self, **kwargs):
        return self
    def score_trace(self, **kwargs):
        pass
    def update_trace(self, **kwargs):
        pass

class NoOpTrace:
    """Fallback no-op trace."""
    trace_id = "local-trace"
    def start_span(self, **kwargs):
        return NoOpSpan()
    def start_observation(self, **kwargs):
        return NoOpSpan()
    def score_trace(self, **kwargs):
        pass
    def update_trace(self, **kwargs):
        pass
    def end(self, **kwargs):
        pass

class LangfuseService:
    _client = None

    @classmethod
    def get_client(cls):
        """Lazy initialization of Langfuse v3 client."""
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
        """Creates a new top-level Langfuse v3 root span & trace for RAG query."""
        client = cls.get_client()
        if not client:
            return NoOpTrace()

        try:
            # Langfuse v3 creates root span which registers the trace
            root_span = client.start_span(
                name=name,
                input={"query": query},
                metadata={
                    "document_id": document_id,
                    **(metadata or {})
                }
            )
            root_span.update_trace(
                user_id=user_id,
                input={"query": query},
                tags=["enterprise-rag", settings.ENVIRONMENT]
            )
            return root_span
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
            span = trace.start_span(
                name="Input Guardrail",
                input={"query_check": "prompt_injection_sanitization"},
                metadata={"latency_ms": latency_ms}
            )
            span.update(output={"is_safe": is_safe, "rejection_reason": rejection_reason})
            span.end()

            trace.score_trace(
                name="input_safety",
                value=1.0 if is_safe else 0.0,
                comment=rejection_reason or "Safe query"
            )
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
            span = trace.start_span(
                name="Vector Retrieval (pgvector)",
                input={"top_k": top_k},
                metadata={"engine": "pgvector_hnsw_cosine", "latency_ms": latency_ms}
            )
            span.update(output={"retrieved_count": retrieved_count, "chunks": chunks_metadata})
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
        latency_ms: float,
        provider: str = "groq"
    ):
        """Logs LLM inference generation observation (Groq or Gemini) to Langfuse."""
        try:
            provider_title = provider.capitalize() if provider else "LLM"
            gen = trace.start_observation(
                as_type="generation",
                name=f"{provider_title} LLM Generation",
                model=model,
                input=prompt,
                output=output,
                metadata={"provider": provider, "temperature": 0.1, "latency_ms": latency_ms}
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
            span = trace.start_span(
                name="Output Guardrail",
                metadata={"citations_count": citations_count}
            )
            span.update(output={
                "is_grounded": is_grounded,
                "abstained": abstained,
                "citations_count": citations_count,
                "abstention_reason": abstention_reason
            })
            span.end()

            trace.score_trace(
                name="grounding_verification",
                value=0.0 if abstained else (1.0 if is_grounded else 0.5),
                comment="Abstained due to insufficient evidence" if abstained else "Verified grounded in retrieved chunks"
            )
            trace.update_trace(
                output={"final_answer": "abstained" if abstained else "grounded_response"}
            )
            trace.end()
        except Exception as e:
            logger.warning(f"Error logging output guardrail to Langfuse: {e}")

    @classmethod
    def flush(cls):
        """Flushes queued events to the Langfuse backend."""
        client = cls.get_client()
        if client:
            try:
                client.flush()
            except Exception as e:
                logger.warning(f"Error flushing Langfuse client: {e}")
