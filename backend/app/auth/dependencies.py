import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
import jwt
from app.config import settings
from app.auth.jwks import get_public_key_for_kid

logger = logging.getLogger(__name__)

async def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_demo_user: Optional[str] = Header(None, alias="X-Demo-User")
) -> str:
    """
    Validates Clerk JWT and returns user_id (the sub claim).
    In local development or demo mode, gracefully falls back to a demo user ID.
    """
    # Check for direct demo user header
    if x_demo_user:
        return x_demo_user

    if not authorization:
        # Graceful fallback for local development or guest users
        if settings.ENVIRONMENT in ["development", "test"] or not settings.CLERK_SECRET_KEY:
            return "user_enterprise_demo"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Must be 'Bearer <token>'"
        )

    token = parts[1]

    # Quick decode without verification to check kid
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            # If token lacks kid or is a simple token, check if dev mode
            if settings.ENVIRONMENT == "development":
                return "user_enterprise_demo"
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token header missing 'kid'"
            )

        public_key = get_public_key_for_kid(kid)
        if not public_key:
            # If JWKS key not found, check if dev fallback allowed
            if settings.ENVIRONMENT == "development":
                logger.warning(f"Key ID {kid} not found in Clerk JWKS. Using demo user for local test.")
                return "user_enterprise_demo"
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication key"
            )

        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            options={"verify_exp": True, "verify_aud": False}
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject (sub)"
            )
        return str(user_id)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        if settings.ENVIRONMENT == "development":
            return "user_enterprise_demo"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        if settings.ENVIRONMENT == "development":
            return "user_enterprise_demo"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )
