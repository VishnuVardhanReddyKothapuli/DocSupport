import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.celery_app import celery_app
from app.database import SyncSessionLocal
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.services.embedding import generate_embeddings_batch
from app.services.git_loader_service import GitLoaderService
from app.services.parsers import DocumentParserService

logger = logging.getLogger(__name__)

def _save_chunks_and_finish(
    session,
    doc_id: uuid.UUID,
    chunks_data: List[Dict[str, Any]],
    git_commit_hash: Optional[str] = None
):
    """Embeds chunks in batch and persists to PostgreSQL with pgvector."""
    if not chunks_data:
        raise ValueError("No text chunks could be extracted from this source.")

    # Generate embeddings
    raw_texts = [c["content"] for c in chunks_data]
    logger.info(f"Generating embeddings for {len(raw_texts)} chunks...")
    embeddings = generate_embeddings_batch(raw_texts)

    # Persist chunks
    chunk_models = []
    for idx, c in enumerate(chunks_data):
        chunk_model = DocumentChunk(
            id=uuid.uuid4(),
            document_id=doc_id,
            chunk_index=c.get("chunk_index", idx),
            content=c["content"],
            embedding=embeddings[idx],
            chunk_metadata=c.get("metadata", {}),
            created_at=datetime.utcnow()
        )
        chunk_models.append(chunk_model)

    session.bulk_save_objects(chunk_models)

    # Update document status
    doc = session.query(Document).filter(Document.id == doc_id).first()
    if doc:
        doc.status = "COMPLETED"
        doc.chunk_count = len(chunk_models)
        if git_commit_hash:
            doc.git_commit_hash = git_commit_hash
        doc.updated_at = datetime.utcnow()
        session.commit()
        logger.info(f"Document {doc_id} successfully indexed with {len(chunk_models)} chunks.")

@celery_app.task(name="app.tasks.ingestion_tasks.ingest_git_repo_task")
def ingest_git_repo_task(
    document_id: str,
    repo_url: str,
    branch: Optional[str] = None,
    file_extensions: Optional[List[str]] = None,
    access_token: Optional[str] = None
):
    """Celery background worker task for cloning & indexing a Git codebase."""
    doc_uuid = uuid.UUID(document_id)
    session = SyncSessionLocal()
    try:
        doc = session.query(Document).filter(Document.id == doc_uuid).first()
        if not doc:
            logger.error(f"Document {document_id} not found.")
            return

        doc.status = "PROCESSING"
        session.commit()

        loader = GitLoaderService(
            repo_url=repo_url,
            branch=branch,
            file_extensions=file_extensions,
            access_token=access_token
        )
        result = loader.process_repository()

        _save_chunks_and_finish(
            session=session,
            doc_id=doc_uuid,
            chunks_data=result["chunks"],
            git_commit_hash=result.get("commit_hash")
        )

    except Exception as e:
        logger.exception(f"Git ingestion failed for document {document_id}: {e}")
        session.rollback()
        doc = session.query(Document).filter(Document.id == doc_uuid).first()
        if doc:
            doc.status = "FAILED"
            doc.failure_reason = str(e)
            doc.updated_at = datetime.utcnow()
            session.commit()
    finally:
        session.close()

@celery_app.task(name="app.tasks.ingestion_tasks.ingest_text_task")
def ingest_text_task(document_id: str, title: str, content: str):
    """Celery task for raw text / markdown ingestion."""
    doc_uuid = uuid.UUID(document_id)
    session = SyncSessionLocal()
    try:
        doc = session.query(Document).filter(Document.id == doc_uuid).first()
        if not doc:
            return
        doc.status = "PROCESSING"
        session.commit()

        chunks = DocumentParserService.parse_text(content, title)
        _save_chunks_and_finish(session, doc_uuid, chunks)

    except Exception as e:
        logger.exception(f"Text ingestion failed: {e}")
        session.rollback()
        doc = session.query(Document).filter(Document.id == doc_uuid).first()
        if doc:
            doc.status = "FAILED"
            doc.failure_reason = str(e)
            session.commit()
    finally:
        session.close()

@celery_app.task(name="app.tasks.ingestion_tasks.ingest_web_task")
def ingest_web_task(document_id: str, url: str, title: Optional[str] = None):
    """Celery task for web page text extraction."""
    doc_uuid = uuid.UUID(document_id)
    session = SyncSessionLocal()
    try:
        doc = session.query(Document).filter(Document.id == doc_uuid).first()
        if not doc:
            return
        doc.status = "PROCESSING"
        session.commit()

        chunks = DocumentParserService.parse_website(url, title)
        _save_chunks_and_finish(session, doc_uuid, chunks)

    except Exception as e:
        logger.exception(f"Web ingestion failed: {e}")
        session.rollback()
        doc = session.query(Document).filter(Document.id == doc_uuid).first()
        if doc:
            doc.status = "FAILED"
            doc.failure_reason = str(e)
            session.commit()
    finally:
        session.close()

@celery_app.task(name="app.tasks.ingestion_tasks.ingest_youtube_task")
def ingest_youtube_task(document_id: str, url: str, title: Optional[str] = None):
    """Celery task for YouTube transcript extraction."""
    doc_uuid = uuid.UUID(document_id)
    session = SyncSessionLocal()
    try:
        doc = session.query(Document).filter(Document.id == doc_uuid).first()
        if not doc:
            return
        doc.status = "PROCESSING"
        session.commit()

        chunks = DocumentParserService.parse_youtube(url, title)
        _save_chunks_and_finish(session, doc_uuid, chunks)

    except Exception as e:
        logger.exception(f"YouTube ingestion failed: {e}")
        session.rollback()
        doc = session.query(Document).filter(Document.id == doc_uuid).first()
        if doc:
            doc.status = "FAILED"
            doc.failure_reason = str(e)
            session.commit()
    finally:
        session.close()

def dispatch_task(task_func, *args, **kwargs):
    """
    Attempts to dispatch via Celery. If Redis is down or unavailable,
    gracefully executes synchronously so the request never fails!
    """
    try:
        task_func.delay(*args, **kwargs)
        logger.info(f"Dispatched Celery task {task_func.__name__} asynchronously.")
    except Exception as e:
        logger.warning(f"Celery dispatch failed ({e}). Running task synchronously in background...")
        import threading
        thread = threading.Thread(target=task_func, args=args, kwargs=kwargs)
        thread.daemon = True
        thread.start()
