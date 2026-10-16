from app.routes.health import router as health_router
from app.routes.documents import router as documents_router
from app.routes.ingest_git import router as git_router
from app.routes.query import router as query_router

__all__ = ["health_router", "documents_router", "git_router", "query_router"]
