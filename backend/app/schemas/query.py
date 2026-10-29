import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class QueryRequest(BaseModel):
    document_id: uuid.UUID = Field(..., description="ID of the document to query")
    query: str = Field(..., min_length=2, max_length=2000, description="User's question")
    top_k: Optional[int] = Field(default=5, ge=1, le=20, description="Number of similarity chunks to retrieve")
    preferred_provider: Optional[str] = Field(default=None, description="Optional LLM preference: 'groq' or 'gemini'")

class Citation(BaseModel):
    id: str
    chunk_index: int
    content: str
    similarity: float
    file_path: Optional[str] = None
    page_number: Optional[int] = None
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    url: Optional[str] = None
    language: Optional[str] = None

class QueryResponse(BaseModel):
    document_id: uuid.UUID
    query: str
    answer: str
    abstained: bool = False
    abstention_reason: Optional[str] = None
    citations: List[Citation] = []
    latency_ms: float = 0.0
    llm_provider: Optional[str] = None
    llm_model: Optional[str] = None
