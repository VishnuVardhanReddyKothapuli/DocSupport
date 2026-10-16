import io
import re
import logging
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
from langchain_core.documents import Document as LCDocument

logger = logging.getLogger(__name__)

# Try importing LangChain text splitter
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentParserService:
    """
    LangChain-based multi-source document parser for:
    - PDF documents (with page-level chunk mapping)
    - Web pages (with clean HTML text extraction)
    - YouTube & media transcripts (with timestamps)
    - Raw text / Markdown
    """

    @classmethod
    def get_splitter(cls, chunk_size: int = 900, chunk_overlap: int = 150) -> RecursiveCharacterTextSplitter:
        """Returns standard LangChain RecursiveCharacterTextSplitter."""
        return RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", "```", ". ", "; ", " ", ""]
        )

    @classmethod
    def parse_pdf(cls, file_bytes: bytes, original_name: str) -> List[Dict[str, Any]]:
        """Parses PDF into LangChain Documents with page metadata, then chunks."""
        reader = PdfReader(io.BytesIO(file_bytes))
        total_pages = len(reader.pages)
        lc_docs: List[LCDocument] = []

        for page_idx, page in enumerate(reader.pages, start=1):
            text = (page.extract_text() or "").strip()
            if not text:
                continue
            lc_docs.append(LCDocument(
                page_content=text,
                metadata={
                    "page_number": page_idx,
                    "total_pages": total_pages,
                    "file_name": original_name,
                    "file_path": original_name
                }
            ))

        splitter = cls.get_splitter()
        split_docs = splitter.split_documents(lc_docs)

        chunks_output: List[Dict[str, Any]] = []
        for idx, doc in enumerate(split_docs):
            chunks_output.append({
                "chunk_index": idx,
                "content": doc.page_content,
                "metadata": doc.metadata
            })

        return chunks_output

    @classmethod
    def parse_website(cls, url: str, custom_title: Optional[str] = None) -> List[Dict[str, Any]]:
        """Extracts webpage HTML into LangChain Documents with clean typography."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DocSupport/1.0"
        }
        res = requests.get(url, headers=headers, timeout=20)
        res.raise_for_status()

        soup = BeautifulSoup(res.text, "html.parser")
        for tag in soup(["script", "style", "noscript", "svg", "iframe", "nav", "footer", "header"]):
            tag.decompose()

        page_title = custom_title or (soup.title.string.strip() if soup.title and soup.title.string else url)
        clean_text = re.sub(r"\n\s*\n+", "\n\n", soup.get_text(separator="\n\n")).strip()

        lc_doc = LCDocument(
            page_content=clean_text,
            metadata={
                "url": url,
                "page_title": page_title,
                "file_path": url
            }
        )

        splitter = cls.get_splitter()
        split_docs = splitter.split_documents([lc_doc])

        chunks_output: List[Dict[str, Any]] = []
        for idx, doc in enumerate(split_docs):
            header = f"# Source: {page_title} ({url})\n"
            meta = dict(doc.metadata)
            meta["line_start"] = idx * 15 + 1
            chunks_output.append({
                "chunk_index": idx,
                "content": f"{header}{doc.page_content}",
                "metadata": meta
            })

        return chunks_output

    @classmethod
    def parse_youtube(cls, url: str, custom_title: Optional[str] = None) -> List[Dict[str, Any]]:
        """Extracts transcript from YouTube URL into timestamped LangChain Documents."""
        from youtube_transcript_api import YouTubeTranscriptApi

        # Extract YouTube video ID
        video_id = None
        patterns = [
            r"(?:v=|\/)([0-9A-Za-z_-]{11}).*",
            r"youtu\.be\/([0-9A-Za-z_-]{11})"
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                video_id = match.group(1)
                break

        if not video_id:
            raise ValueError(f"Could not extract YouTube video ID from URL: {url}")

        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        except Exception:
            transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
            transcript = transcripts.find_transcript(['en', 'en-US', 'es', 'fr', 'de'])
            transcript_list = transcript.fetch()

        title = custom_title or f"YouTube Video: {video_id}"
        
        full_text_parts = []
        for entry in transcript_list:
            start_sec = int(entry.get("start", 0))
            minutes = start_sec // 60
            seconds = start_sec % 60
            timestamp = f"[{minutes:02d}:{seconds:02d}]"
            full_text_parts.append(f"{timestamp} {entry.get('text', '')}")

        aggregated_text = "\n".join(full_text_parts)
        lc_doc = LCDocument(
            page_content=aggregated_text,
            metadata={
                "url": url,
                "video_id": video_id,
                "title": title,
                "file_path": url
            }
        )

        splitter = cls.get_splitter()
        split_docs = splitter.split_documents([lc_doc])

        chunks_output: List[Dict[str, Any]] = []
        for idx, doc in enumerate(split_docs):
            header = f"# Video Transcript: {title} ({url})\n"
            chunks_output.append({
                "chunk_index": idx,
                "content": f"{header}{doc.page_content}",
                "metadata": doc.metadata
            })

        return chunks_output

    @classmethod
    def parse_text(cls, text: str, title: str) -> List[Dict[str, Any]]:
        """Parses raw text/markdown into LangChain Documents with line mapping."""
        clean_text = text.strip()
        lines = clean_text.splitlines()

        lc_doc = LCDocument(
            page_content=clean_text,
            metadata={
                "file_path": title,
                "total_lines": len(lines)
            }
        )

        splitter = cls.get_splitter()
        split_docs = splitter.split_documents([lc_doc])

        chunks_output: List[Dict[str, Any]] = []
        curr_pos = 0
        for idx, doc in enumerate(split_docs):
            found_idx = clean_text.find(doc.page_content[:50], curr_pos)
            if found_idx == -1:
                found_idx = curr_pos
            end_idx = found_idx + len(doc.page_content)
            curr_pos = max(0, found_idx)

            line_start = clean_text.count("\n", 0, found_idx) + 1
            line_end = clean_text.count("\n", 0, end_idx) + 1

            meta = dict(doc.metadata)
            meta["line_start"] = line_start
            meta["line_end"] = line_end

            chunks_output.append({
                "chunk_index": idx,
                "content": doc.page_content,
                "metadata": meta
            })

        return chunks_output
