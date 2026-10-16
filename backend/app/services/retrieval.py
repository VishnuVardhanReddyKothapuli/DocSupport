import uuid
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.embedding import generate_embedding
from app.schemas.query import Citation

logger = logging.getLogger(__name__)

class RetrievalService:
    @staticmethod
    async def search_chunks(
        db: AsyncSession,
        document_id: uuid.UUID,
        query: str,
        top_k: int = 5,
        min_similarity: float = 0.25
    ) -> List[Citation]:
        """
        Generates query embedding and executes sub-second pgvector cosine similarity search
        filtered by document_id.
        """
        # 1. Generate 768-d query vector
        query_vec = generate_embedding(query)
        vec_str = "[" + ",".join(str(round(v, 6)) for v in query_vec) + "]"

        # 2. Execute vector cosine similarity SQL
        # 1 - (embedding <=> :query_vector) represents cosine similarity
        query_sql = text("""
            SELECT 
                id, 
                chunk_index, 
                content, 
                metadata, 
                1 - (embedding <=> CAST(:query_vector AS vector)) AS similarity
            FROM document_chunks
            WHERE document_id = :doc_id
            ORDER BY similarity DESC
            LIMIT :top_k;
        """)

        result = await db.execute(
            query_sql,
            {
                "query_vector": vec_str,
                "doc_id": document_id,
                "top_k": top_k
            }
        )
        rows = result.fetchall()

        citations: List[Citation] = []
        for row in rows:
            chunk_id = str(row[0])
            chunk_index = int(row[1])
            content = str(row[2])
            raw_meta = row[3] or {}
            similarity = float(row[4])

            # Apply relevance threshold
            if similarity < min_similarity:
                continue

            citation = Citation(
                id=chunk_id,
                chunk_index=chunk_index,
                content=content,
                similarity=round(similarity, 4),
                file_path=raw_meta.get("file_path"),
                page_number=raw_meta.get("page_number"),
                line_start=raw_meta.get("line_start"),
                line_end=raw_meta.get("line_end"),
                url=raw_meta.get("url") or raw_meta.get("source_url"),
                language=raw_meta.get("language")
            )
            citations.append(citation)

        return citations
