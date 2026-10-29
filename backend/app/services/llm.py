import logging
from typing import List, Optional, Tuple, Dict, Any
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
    def _execute_groq(user_content: str, temperature: float = 0.1) -> Tuple[Optional[str], Optional[str]]:
        """
        Executes strictly grounded LLM inference using Groq API.
        Returns: (answer_text, model_candidate) or (None, None) on failure.
        """
        groq_key = settings.GROQ_API_KEY
        if not groq_key or groq_key.startswith("your_"):
            logger.info("Groq API key not configured or contains placeholder.")
            return None, None

        try:
            from groq import Groq
            client = Groq(api_key=groq_key)

            candidate_models = [
                settings.GROQ_MODEL,
                settings.GROQ_GUARD_MODEL,
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "openai/gpt-oss-120b",
                "qwen/qwen3.8-27b",
                "openai/gpt-oss-20b",
                "mixtral-8x7b-32768"
            ]

            # Remove duplicates while preserving order
            seen = set()
            models_to_try = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

            last_error = None
            for model_candidate in models_to_try:
                try:
                    logger.info(f"Attempting Groq inference with model: {model_candidate}")
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
                        return ans, model_candidate
                except Exception as model_err:
                    last_error = model_err
                    logger.warning(f"Groq candidate '{model_candidate}' failed: {model_err}")
                    continue

            if last_error:
                logger.error(f"All Groq candidate models failed. Last error: {last_error}")
            return None, None

        except Exception as e:
            logger.error(f"Groq client initialization or execution failed: {e}")
            return None, None

    @staticmethod
    def _execute_gemini(user_content: str, temperature: float = 0.1) -> Tuple[Optional[str], Optional[str]]:
        """
        Executes strictly grounded LLM inference using Google Gemini API.
        Supports google.genai, google.generativeai, and HTTP REST fallback.
        Returns: (answer_text, model_candidate) or (None, None) on failure.
        """
        gemini_key = settings.GEMINI_API_KEY
        if not gemini_key or gemini_key.startswith("your_"):
            logger.info("Gemini API key not configured or contains placeholder.")
            return None, None

        candidate_models = [
            settings.GEMINI_MODEL,
            settings.GEMINI_FALLBACK_MODEL,
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-2.5-pro"
        ]

        seen = set()
        models_to_try = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

        # Method 1: Google GenAI Client (google.genai SDK)
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=gemini_key)

            for model_candidate in models_to_try:
                try:
                    clean_model = model_candidate.replace("models/", "")
                    logger.info(f"Attempting Google GenAI inference with model: {clean_model}")
                    response = client.models.generate_content(
                        model=clean_model,
                        contents=user_content,
                        config=types.GenerateContentConfig(
                            system_instruction=SYSTEM_PROMPT,
                            temperature=temperature,
                            max_output_tokens=1024
                        )
                    )
                    if response and response.text:
                        ans = response.text.strip()
                        if ans:
                            return ans, clean_model
                except Exception as sdk_err:
                    logger.warning(f"Google GenAI model '{model_candidate}' failed: {sdk_err}")
                    continue
        except Exception as init_err:
            logger.debug(f"google.genai client initialization error: {init_err}")

        # Method 2: Legacy google.generativeai SDK fallback
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=gemini_key)

            for model_candidate in models_to_try:
                try:
                    clean_model = model_candidate.replace("models/", "")
                    logger.info(f"Attempting google.generativeai inference with model: {clean_model}")
                    model = legacy_genai.GenerativeModel(
                        model_name=clean_model,
                        system_instruction=SYSTEM_PROMPT
                    )
                    response = model.generate_content(
                        user_content,
                        generation_config={
                            "temperature": temperature,
                            "max_output_tokens": 1024
                        }
                    )
                    if response and response.text:
                        ans = response.text.strip()
                        if ans:
                            return ans, clean_model
                except Exception as legacy_err:
                    logger.warning(f"Legacy Gemini model '{model_candidate}' failed: {legacy_err}")
                    continue
        except Exception as legacy_init_err:
            logger.debug(f"google.generativeai initialization error: {legacy_init_err}")

        # Method 3: Direct HTTPS REST API fallback
        try:
            import httpx
            for model_candidate in models_to_try:
                try:
                    clean_model = model_candidate.replace("models/", "")
                    logger.info(f"Attempting Gemini REST API inference with model: {clean_model}")
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={gemini_key}"
                    payload = {
                        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                        "contents": [{"parts": [{"text": user_content}]}],
                        "generationConfig": {
                            "temperature": temperature,
                            "maxOutputTokens": 1024
                        }
                    }
                    resp = httpx.post(url, json=payload, timeout=25.0)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                ans = parts[0].get("text", "").strip()
                                if ans:
                                    return ans, clean_model
                    else:
                        logger.warning(f"Gemini REST API '{clean_model}' returned HTTP {resp.status_code}: {resp.text[:200]}")
                except Exception as rest_err:
                    logger.warning(f"Gemini REST candidate '{model_candidate}' failed: {rest_err}")
                    continue
        except Exception as rest_err:
            logger.error(f"Gemini REST fallback failed: {rest_err}")

        return None, None

    @classmethod
    def generate_grounded_answer_with_metadata(
        cls,
        query: str,
        citations: List[Citation],
        temperature: float = 0.1,
        preferred_provider: Optional[str] = None
    ) -> Tuple[str, str, str]:
        """
        Executes strictly grounded LLM inference with dual mutual failover:
        - If primary is Groq and Groq fails, Gemini takes charge.
        - If primary is Gemini and Gemini fails, Groq takes charge.
        - And vice versa!
        Returns: (answer_text, provider_used, model_used)
        """
        if not citations:
            return ABSTENTION_PHRASE, "guardrail", "none"

        context_str = format_context_prompt(citations)
        user_content = f"""CONTEXT:
{context_str}

USER QUESTION:
{query}

ANSWER (Grounded strictly in above context with bracketed citations [1], [2], or abstain):"""

        # Determine primary provider order
        primary = (preferred_provider or settings.PRIMARY_LLM_PROVIDER or "groq").lower().strip()
        if primary not in ("groq", "gemini"):
            primary = "groq"

        # Check key presence to smartly choose initial provider
        groq_has_key = bool(settings.GROQ_API_KEY and not settings.GROQ_API_KEY.startswith("your_"))
        gemini_has_key = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"))

        if primary == "groq" and not groq_has_key and gemini_has_key:
            logger.info("Groq API key not configured; Gemini will act as primary provider.")
            primary = "gemini"
        elif primary == "gemini" and not gemini_has_key and groq_has_key:
            logger.info("Gemini API key not configured; Groq will act as primary provider.")
            primary = "groq"

        # Setup primary and secondary fallback functions
        if primary == "groq":
            first_provider, first_func = "groq", cls._execute_groq
            second_provider, second_func = "gemini", cls._execute_gemini
        else:
            first_provider, first_func = "gemini", cls._execute_gemini
            second_provider, second_func = "groq", cls._execute_groq

        # Attempt First Provider
        logger.info(f"Executing LLM generation with primary provider: '{first_provider}'")
        ans, model = first_func(user_content, temperature=temperature)
        if ans:
            logger.info(f"Primary provider '{first_provider}' succeeded with model '{model}'")
            return ans, first_provider, model or first_provider

        # Primary failed -> Secondary takes charge!
        logger.warning(
            f"Primary provider '{first_provider}' failed or was unavailable. "
            f"MUTUAL FAILOVER ENGAGED: '{second_provider}' is now taking charge!"
        )
        ans, model = second_func(user_content, temperature=temperature)
        if ans:
            logger.info(f"Failover successful: '{second_provider}' generated answer with model '{model}'")
            return ans, second_provider, model or second_provider

        # Both providers failed -> Local grounded heuristic fallback
        logger.error(
            f"Both primary ('{first_provider}') and backup ('{second_provider}') providers failed. "
            f"Falling back to local grounded token overlap heuristic."
        )

        query_words = set(query.lower().split())
        best_chunk = citations[0]
        chunk_words = set(best_chunk.content.lower().split())
        overlap = query_words.intersection(chunk_words)

        if len(overlap) < 2:
            return ABSTENTION_PHRASE, "heuristic", "abstention"

        fallback_ans = f"Based on the provided source [1] ({best_chunk.file_path or 'document'}):\n\n{best_chunk.content[:400]}..."
        return fallback_ans, "heuristic", "local_overlap"

    @classmethod
    def generate_grounded_answer(
        cls,
        query: str,
        citations: List[Citation],
        temperature: float = 0.1,
        preferred_provider: Optional[str] = None
    ) -> str:
        """
        Executes strictly grounded LLM inference, returning the answer string
        for complete backward compatibility.
        """
        ans, _, _ = cls.generate_grounded_answer_with_metadata(
            query=query,
            citations=citations,
            temperature=temperature,
            preferred_provider=preferred_provider
        )
        return ans
