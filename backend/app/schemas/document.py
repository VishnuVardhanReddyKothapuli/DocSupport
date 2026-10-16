import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class DocumentBase(BaseModel):
    original_name: str
    source_type: str = Field(description="'PDF' | 'WEBSITE' | 'YOUTUBE' | 'TEXT' | 'GIT'")
    source_url: Optional[str] = None
    git_branch: Optional[str] = None
    git_commit_hash: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class TextIngestRequest(BaseModel):
    title: str = Field(..., max_length=255, description="Document title/label")
    content: str = Field(..., min_length=10, max_length=1000000, description="Raw text or markdown content")

class WebIngestRequest(BaseModel):
    url: str = Field(..., description="Target webpage URL")
    title: Optional[str] = None

class YouTubeIngestRequest(BaseModel):
    url: str = Field(..., description="YouTube video or transcript URL")
    title: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: uuid.UUID
    user_id: str
    status: str
    failure_reason: Optional[str] = None
    chunk_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
