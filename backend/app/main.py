import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routes.health import router as health_router
from app.routes.documents import router as documents_router
from app.routes.ingest_git import router as git_router
from app.routes.query import router as query_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("docsupport")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event to initialize database schema and extensions on startup."""
    logger.info("Initializing DocSupport backend services...")
    await init_db()
    logger.info("DocSupport backend services initialized and ready.")
    yield
    logger.info("Shutting down DocSupport backend services...")

app = FastAPI(
    title="DocSupport Enterprise RAG Platform",
    description="Full-stack Enterprise RAG platform with GitLoader codebase indexing, dual guardrails, and pgvector search.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Swagger Docs Redirection (/doc -> /docs)
@app.get("/doc", include_in_schema=False)
async def redirect_doc_to_docs():
    """Redirects /doc to /docs as specified in architecture requirements."""
    return RedirectResponse(url="/docs")

# Include Routers
app.include_router(health_router)
app.include_router(documents_router)
app.include_router(git_router)
app.include_router(query_router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "platform": "DocSupport Enterprise RAG Platform",
        "status": "operational",
        "docs_url": "/docs",
        "swagger_alias": "/doc",
        "vector_db": "PostgreSQL 16 + pgvector",
        "embedding_model": settings.EMBEDDING_MODEL_NAME,
        "llm_engine": settings.GROQ_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
