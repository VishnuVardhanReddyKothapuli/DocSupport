import time
import logging
from typing import Dict, Any, Optional
import requests
import jwt
from jwt.algorithms import RSAAlgorithm
from app.config import settings

logger = logging.getLogger(__name__)

# In-memory cache for JWKS keys: {kid: public_key}
_JWKS_CACHE: Dict[str, Any] = {}
_LAST_CACHE_FETCH: float = 0
_CACHE_TTL_SECONDS: int = 3600  # 1 hour

def fetch_jwks(force: bool = False) -> Dict[str, Any]:
    """Fetches and caches Clerk JWKS public keys."""
    global _JWKS_CACHE, _LAST_CACHE_FETCH
    current_time = time.time()
    
    if not force and _JWKS_CACHE and (current_time - _LAST_CACHE_FETCH < _CACHE_TTL_SECONDS):
        return _JWKS_CACHE

    jwks_url = settings.CLERK_JWKS_URL
    if not jwks_url or "api.clerk.com" in jwks_url and not settings.CLERK_SECRET_KEY:
        logger.info("No active Clerk JWKS URL configured; running in mock/demo auth mode.")
        return {}

    try:
        response = requests.get(jwks_url, timeout=5)
        if response.status_code == 200:
            jwks_data = response.json()
            keys = {}
            for key_dict in jwks_data.get("keys", []):
                kid = key_dict.get("kid")
                if kid:
                    public_key = RSAAlgorithm.from_jwk(key_dict)
                    keys[kid] = public_key
            _JWKS_CACHE = keys
            _LAST_CACHE_FETCH = current_time
            logger.info(f"Loaded {len(keys)} public keys from Clerk JWKS.")
            return _JWKS_CACHE
        else:
            logger.warning(f"Failed to fetch JWKS from {jwks_url}: HTTP {response.status_code}")
    except Exception as e:
        logger.warning(f"Exception while retrieving Clerk JWKS: {e}")

    return _JWKS_CACHE

def get_public_key_for_kid(kid: str) -> Optional[Any]:
    """Retrieves cached public key by kid or refreshes cache once."""
    keys = fetch_jwks()
    if kid in keys:
        return keys[kid]
    # Refresh cache once if not found
    keys = fetch_jwks(force=True)
    return keys.get(kid)
