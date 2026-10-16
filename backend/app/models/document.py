import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(128), index=True, nullable=False)
    original_name = Column(String(255), nullable=False)
    source_type = Column(
        String(32),
        nullable=False,
        doc="Enum: 'PDF' | 'WEBSITE' | 'YOUTUBE' | 'TEXT' | 'GIT'"
    )
    source_url = Column(Text, nullable=True)
    git_branch = Column(String(100), nullable=True)
    git_commit_hash = Column(String(64), nullable=True)
    status = Column(
        String(32),
        default="PENDING",
        nullable=False,
        doc="Enum: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'"
    )
    failure_reason = Column(Text, nullable=True)
    chunk_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan", lazy="selectin")
