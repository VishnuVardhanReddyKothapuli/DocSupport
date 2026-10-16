import uuid
import logging
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.document import Document
from app.schemas.git_loader import GitIngestRequest
from app.schemas.document import DocumentResponse
from app.tasks.ingestion_tasks import ingest_git_repo_task, dispatch_task

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents/git", tags=["Git Loader"])

def _extract_repo_name(url: str) -> str:
    """Extracts a readable repository name from Git URL."""
    try:
        path = urlparse(url).path.strip("/")
        if path.endswith(".git"):
            path = path[:-4]
        parts = path.split("/")
        if len(parts) >= 2:
            return f"{parts[-2]}/{parts[-1]}"
        elif len(parts) == 1 and parts[0]:
            return parts[0]
    except Exception:
        pass
    return url

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_git_repository(
    payload: GitIngestRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    """
    Clones, filters, and indexes a remote Git repository codebase into vector store.
    Extracts commit hash, file paths, line numbers, and architectural context.
    """
    if not payload.repo_url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Repository URL cannot be empty."
        )

    # Determine display name
    doc_name = payload.name or _extract_repo_name(payload.repo_url)

    doc = Document(
        id=uuid.uuid4(),
        user_id=user_id,
        original_name=doc_name,
        source_type="GIT",
        source_url=payload.repo_url,
        git_branch=payload.branch,
        status="PENDING",
        chunk_count=0
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    logger.info(f"Dispatched GitLoader task for repo {payload.repo_url} (doc: {doc.id})")
    dispatch_task(
        ingest_git_repo_task,
        str(doc.id),
        payload.repo_url,
        payload.branch,
        payload.file_extensions,
        payload.access_token
    )

    return doc
