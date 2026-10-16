import logging
from typing import List, Optional
from app.config import settings
from app.schemas.query import Citation
from app.services.guardrails import ABSTENTION_PHRASE

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert enterprise Retrieval-Augmented Generation (RAG) assistant operating under strict grounding guardrails.

CRITICAL INSTRUCTIONS:
1. Answer the user's question using ONLY facts and evidence explicitly stated in the supplied context chunks below.
2. Never extrapolate, speculate, or introduce outside knowledge.
3. Every factual claim must be backed by a verbatim bracketed citation corresponding to the chunk index number, e.g., [1] or [2].
4. If the provided context does not contain sufficient direct evidence to answer the user's question truthfully, you MUST output EXACTLY this phrase and nothing else:
I am unable to answer this question based on the provided document.
"""

def format_context_prompt(chunks: List[Citation]) -> str:
    """Formats retrieved chunks with 1-based indexing for the LLM."""
    if not chunks:
        return "No relevant context available."

    formatted = []
    for idx, c in enumerate(chunks, start=1):
        source_label = c.file_path or c.url or "Document"
        meta_parts = [f"Source: {source_label}"]
        if c.page_number:
            meta_parts.append(f"Page: {c.page_number}")
        if c.line_start and c.line_end:
            meta_parts.append(f"Lines: {c.line_start}-{c.line_end}")
        
        meta_str = " | ".join(meta_parts)
        formatted.append(f"--- Chunk [{idx}] ({meta_str}) ---\n{c.content.strip()}\n")

    return "\n".join(formatted)

class LLMService:
    @staticmethod
    def generate_grounded_answer(
        query: str,
        citations: List[Citation],
        temperature: float = 0.1
    ) -> str:
        """
        Executes strictly grounded LLM inference using Groq API (llama-3.3-70b-versatile).
        """
        if not citations:
            return ABSTENTION_PHRASE

        context_str = format_context_prompt(citations)

        user_content = f"""CONTEXT:
{context_str}

USER QUESTION:
{query}

ANSWER (Grounded strictly in above context with bracketed citations [1], [2], or abstain):"""

        groq_key = settings.GROQ_API_KEY
        if groq_key and not groq_key.startswith("your_"):
            try:
                from groq import Groq
                client = Groq(api_key=groq_key)

                candidate_models = [
                    settings.GROQ_MODEL,
                    settings.GROQ_GUARD_MODEL,
                    "openai/gpt-oss-120b",
                    "qwen/qwen3.8-27b",
                    "openai/gpt-oss-20b",
                    "llama-3.3-70b-versatile"
                ]
                
                # Remove duplicates while preserving order
                seen = set()
                models_to_try = [m for m in candidate_models if not (m in seen or seen.add(m))]

                for model_candidate in models_to_try:
                    try:
                        response = client.chat.completions.create(
                            model=model_candidate,
                            messages=[
                                {"role": "system", "content": SYSTEM_PROMPT},
                                {"role": "user", "content": user_content}
                            ],
                            temperature=temperature,
                            max_tokens=1024
                        )
                        ans = response.choices[0].message.content.strip()
                        if ans:
                            return ans
                    except Exception as model_err:
                        logger.warning(f"Model {model_candidate} attempt failed: {model_err}")
                        continue

            except Exception as e:
                logger.error(f"Groq API call encountered an error: {e}")

        # Local fallback heuristic when API is offline: check query token overlap
        query_words = set(query.lower().split())
        best_chunk = citations[0]
        chunk_words = set(best_chunk.content.lower().split())
        overlap = query_words.intersection(chunk_words)

        if len(overlap) < 2:
            return ABSTENTION_PHRASE

        return f"Based on the provided source [1] ({best_chunk.file_path or 'document'}):\n\n{best_chunk.content[:400]}..."
