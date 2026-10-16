import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine, text
from app.config import settings

logger = logging.getLogger(__name__)

# Base Model
Base = declarative_base()

# Async Engine (for FastAPI routes)
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Synchronous Engine (for Celery workers & script tasks)
sync_engine = create_engine(
    settings.SYNC_DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def get_sync_db():
    """Context/session for Celery background workers."""
    session = SyncSessionLocal()
    try:
        yield session
    finally:
        session.close()

async def init_db():
    """Initializes pgvector extension and creates database schema if needed."""
    try:
        # Import models so they are registered in Base.metadata
        import app.models  # noqa: F401
        async with async_engine.begin() as conn:
            # Enable pgvector extension
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            # Create all tables defined in models
            await conn.run_sync(Base.metadata.create_all)
            # Create HNSW index on document_chunks table if not exists
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw 
                ON document_chunks USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64);
            """))
        logger.info("Database and vector extension initialized successfully.")
    except Exception as e:
        logger.warning(f"Error initializing DB schema automatically: {e}")
