import uuid
import logging
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.schemas.document import (
    DocumentResponse,
    DocumentListResponse,
    TextIngestRequest,
    WebIngestRequest,
    YouTubeIngestRequest
)
from app.tasks.ingestion_tasks import (
    ingest_text_task,
    ingest_web_task,
    ingest_youtube_task,
    dispatch_task
)
from app.services.parsers import DocumentParserService
from app.services.embedding import generate_embeddings_batch

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("", response_model=DocumentListResponse)
async def list_documents(
    source_type: Optional[str] = Query(None, description="Filter by source type: PDF, WEBSITE, YOUTUBE, TEXT, GIT"),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Lists all knowledge sources for the authenticated user."""
    stmt = select(Document).where(Document.user_id == user_id).order_by(Document.created_at.desc())
    if source_type:
        stmt = stmt.where(Document.source_type == source_type.upper())

    result = await db.execute(stmt)
    docs = result.scalars().all()
    return DocumentListResponse(documents=docs, total=len(docs))

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Retrieves metadata and indexing status for a single document."""
    stmt = select(Document).where(Document.id == document_id, Document.user_id == user_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Deletes a document and cascades deletion to all associated chunks."""
    stmt = select(Document).where(Document.id == document_id, Document.user_id == user_id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    await db.delete(doc)
    await db.commit()
    return None

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_pdf_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Uploads and indexes a PDF document with page-level chunk mapping."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are supported on this endpoint")

    content_bytes = await file.read()
    if len(content_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    doc = Document(
        id=uuid.uuid4(),
        user_id=user_id,
        original_name=file.filename,
        source_type="PDF",
        status="PROCESSING",
        chunk_count=0
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Process and index chunks immediately
    try:
        chunks_data = DocumentParserService.parse_pdf(content_bytes, file.filename)
        if not chunks_data:
            doc.status = "FAILED"
            doc.failure_reason = "No extractable text found in PDF."
            await db.commit()
            return doc

        raw_texts = [c["content"] for c in chunks_data]
        embeddings = generate_embeddings_batch(raw_texts)

        for idx, c in enumerate(chunks_data):
            chunk = DocumentChunk(
                id=uuid.uuid4(),
                document_id=doc.id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                embedding=embeddings[idx],
                chunk_metadata=c["metadata"]
            )
            db.add(chunk)

        doc.status = "COMPLETED"
        doc.chunk_count = len(chunks_data)
        doc.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(doc)

    except Exception as e:
        logger.exception(f"Error parsing PDF {file.filename}: {e}")
        doc.status = "FAILED"
        doc.failure_reason = str(e)
        await db.commit()
        await db.refresh(doc)

    return doc

@router.post("/text", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_raw_text(
    payload: TextIngestRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Direct raw text / markdown ingestion."""
    doc = Document(
        id=uuid.uuid4(),
        user_id=user_id,
        original_name=payload.title,
        source_type="TEXT",
        status="PENDING",
        chunk_count=0
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    dispatch_task(ingest_text_task, str(doc.id), payload.title, payload.content)
    return doc

@router.post("/web", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_web_page(
    payload: WebIngestRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Scrapes and indexes a webpage URL."""
    doc_name = payload.title or payload.url
    doc = Document(
        id=uuid.uuid4(),
        user_id=user_id,
        original_name=doc_name,
        source_type="WEBSITE",
        source_url=payload.url,
        status="PENDING",
        chunk_count=0
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    dispatch_task(ingest_web_task, str(doc.id), payload.url, payload.title)
    return doc

@router.post("/youtube", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_youtube_video(
    payload: YouTubeIngestRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """Extracts and indexes YouTube transcripts."""
    doc_name = payload.title or payload.url
    doc = Document(
        id=uuid.uuid4(),
        user_id=user_id,
        original_name=doc_name,
        source_type="YOUTUBE",
        source_url=payload.url,
        status="PENDING",
        chunk_count=0
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    dispatch_task(ingest_youtube_task, str(doc.id), payload.url, payload.title)
    return doc
