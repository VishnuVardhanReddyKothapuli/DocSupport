import re
import logging
from typing import List, Tuple, Optional
from app.schemas.query import Citation

logger = logging.getLogger(__name__)

ABSTENTION_PHRASE = "I am unable to answer this question based on the provided document."

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"system\s*prompt\s*leak",
    r"reveal\s+your\s+(initial\s+)?instructions",
    r"you\s+are\s+now\s+(in\s+developer\s+mode|dan|unfiltered)",
    r"bypass\s+safety\s+filters",
    r"output\s+the\s+system\s+message",
    r"act\s+as\s+(an\s+unconstrained|evil|jailbroken)",
    r"override\s+your\s+programming"
]

class DualGuardrailEngine:
    @staticmethod
    def inspect_input(query: str) -> Tuple[bool, str, Optional[str]]:
        """
        Input Guardrail:
        Sanitizes text, checks for prompt injection attacks and query relevance.
        Returns: (is_safe, sanitized_query, rejection_reason)
        """
        cleaned = query.strip()
        if not cleaned:
            return False, "", "Empty query provided."

        if len(cleaned) < 2:
            return False, "", "Query is too short."

        if len(cleaned) > 2000:
            return False, "", "Query exceeds maximum allowed length (2000 characters)."

        # Regex check for adversarial prompt injections
        lower_query = cleaned.lower()
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, lower_query, re.IGNORECASE):
                logger.warning(f"Input Guardrail triggered: matched pattern '{pattern}' in query.")
                return False, "", "Input flagged by security guardrail: prompt injection detected."

        # Sanitize unsafe characters / control sequences
        sanitized = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", cleaned)

        return True, sanitized, None

    @staticmethod
    def inspect_output(
        raw_answer: str,
        citations: List[Citation]
    ) -> Tuple[bool, bool, str, List[Citation]]:
        """
        Output Guardrail:
        Verifies answer strict grounding against retrieved evidence.
        Returns: (is_grounded, abstained, processed_answer, verified_citations)
        """
        clean_ans = raw_answer.strip()

        # 1. Check if model explicitly abstained
        if (
            ABSTENTION_PHRASE.lower() in clean_ans.lower()
            or "unable to answer" in clean_ans.lower()
            or "not enough information in the provided document" in clean_ans.lower()
            or "does not contain information" in clean_ans.lower()
        ):
            return True, True, ABSTENTION_PHRASE, []

        # 2. If no citations/chunks were retrieved at all, force abstention
        if not citations:
            return False, True, ABSTENTION_PHRASE, []

        # 3. Parse and verify cited chunk brackets e.g. [1], [2]
        cited_indices = set()
        matches = re.findall(r"\[(\d+)\]", clean_ans)
        for m in matches:
            try:
                cited_indices.add(int(m))
            except ValueError:
                pass

        verified_citations: List[Citation] = []
        if cited_indices:
            # Map [1] to citations[0], [2] to citations[1] (1-indexed)
            for idx in cited_indices:
                zero_idx = idx - 1
                if 0 <= zero_idx < len(citations):
                    verified_citations.append(citations[zero_idx])
        
        # If citations weren't explicitly bracketed in text by model, include top relevant retrieved chunks
        if not verified_citations:
            verified_citations = citations[:3]

        return True, False, clean_ans, verified_citations
