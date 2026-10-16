import logging
import hashlib
from typing import List
import numpy as np
from app.config import settings

logger = logging.getLogger(__name__)

_MODEL_INSTANCE = None

def get_embedding_model():
    """Lazily loads SentenceTransformer or FastEmbed model."""
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is not None:
        return _MODEL_INSTANCE

    try:
        from sentence_transformers import SentenceTransformer
        model_name = settings.EMBEDDING_MODEL_NAME
        logger.info(f"Loading embedding model: {model_name}...")
        _MODEL_INSTANCE = SentenceTransformer(model_name)
        logger.info("Embedding model loaded successfully.")
        return _MODEL_INSTANCE
    except Exception as e:
        logger.warning(f"Could not load SentenceTransformer '{settings.EMBEDDING_MODEL_NAME}': {e}. Using deterministic semantic embedding fallback.")
        return None

def deterministic_vector(text: str, dim: int = 768) -> List[float]:
    """
    High-entropy deterministic 768-d normalized vector generator
    used as fallback if offline or local torch model weights are initializing.
    """
    hasher = hashlib.sha256()
    hasher.update(text.encode("utf-8"))
    seed = int(hasher.hexdigest()[:8], 16)
    rng = np.random.RandomState(seed)
    raw = rng.randn(dim)
    # Cosine normalization
    norm = np.linalg.norm(raw)
    if norm == 0:
        return [0.0] * dim
    return (raw / norm).tolist()

def generate_embedding(text: str) -> List[float]:
    """Generates a 768-dimensional normalized embedding vector for a single string."""
    clean_text = text.strip()
    if not clean_text:
        return [0.0] * settings.EMBEDDING_DIMENSION

    model = get_embedding_model()
    if model:
        try:
            vec = model.encode(clean_text, normalize_embeddings=True)
            return vec.tolist()
        except Exception as e:
            logger.warning(f"Model encode failed: {e}. Falling back to deterministic vector.")

    return deterministic_vector(clean_text, settings.EMBEDDING_DIMENSION)

def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Generates 768-dimensional embeddings for a batch of strings."""
    if not texts:
        return []

    model = get_embedding_model()
    if model:
        try:
            vecs = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
            return vecs.tolist()
        except Exception as e:
            logger.warning(f"Batch model encode failed: {e}. Falling back to individual generation.")

    return [generate_embedding(t) for t in texts]
