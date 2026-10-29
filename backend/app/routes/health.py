import time
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
async def health_check():
    """Basic liveness probe for AWS ALB / Render."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "DocSupport RAG Platform API",
        "environment": settings.ENVIRONMENT
    }

@router.get("/ready")
@router.get("/api/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Comprehensive readiness probe checking PostgreSQL and pgvector for AWS target groups."""
    db_ok = False
    vector_ok = False
    try:
        res = await db.execute(text("SELECT 1;"))
        db_ok = res.scalar() == 1
        
        vec_res = await db.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector';"))
        vector_ok = vec_res.scalar() == "vector"
    except Exception as e:
        db_err = str(e)
    else:
        db_err = None

    return {
        "ready": db_ok and vector_ok,
        "database": "connected" if db_ok else "unreachable",
        "pgvector_extension": "active" if vector_ok else "missing",
        "error": db_err
    }
