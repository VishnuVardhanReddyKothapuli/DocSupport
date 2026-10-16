import re
from typing import List, Dict, Any, Optional

class RecursiveCharacterTextSplitter:
    def __init__(
        self,
        chunk_size: int = 900,
        chunk_overlap: int = 150,
        separators: Optional[List[str]] = None
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", "```", ". ", "; ", " ", ""]

    def split_text(self, text: str) -> List[str]:
        """Recursively splits text into chunks under chunk_size with overlap."""
        final_chunks: List[str] = []
        text = text.strip()
        if not text:
            return []

        if len(text) <= self.chunk_size:
            return [text]

        # Determine best separator
        chosen_sep = ""
        for sep in self.separators:
            if sep in text:
                chosen_sep = sep
                break

        if not chosen_sep:
            # Fallback to fixed character slice
            chunks = []
            for i in range(0, len(text), self.chunk_size - self.chunk_overlap):
                chunks.append(text[i:i + self.chunk_size])
            return chunks

        splits = text.split(chosen_sep)
        good_splits: List[str] = []
        curr_chunk = ""

        for part in splits:
            candidate = f"{curr_chunk}{chosen_sep}{part}" if curr_chunk else part
            if len(candidate) <= self.chunk_size:
                curr_chunk = candidate
            else:
                if curr_chunk:
                    good_splits.append(curr_chunk)
                if len(part) > self.chunk_size:
                    # Recursive split on this large part
                    sub_splitter = RecursiveCharacterTextSplitter(
                        chunk_size=self.chunk_size,
                        chunk_overlap=self.chunk_overlap,
                        separators=[s for s in self.separators if s != chosen_sep]
                    )
                    good_splits.extend(sub_splitter.split_text(part))
                    curr_chunk = ""
                else:
                    curr_chunk = part

        if curr_chunk:
            good_splits.append(curr_chunk)

        # Merge with overlap
        merged_chunks: List[str] = []
        for i, piece in enumerate(good_splits):
            piece = piece.strip()
            if not piece:
                continue
            if self.chunk_overlap > 0 and merged_chunks and i > 0:
                prev = merged_chunks[-1]
                overlap_text = prev[-self.chunk_overlap:]
                # Prepend overlap context if not already starting with it
                if not piece.startswith(overlap_text):
                    combined = f"{overlap_text} {piece}".strip()
                    if len(combined) <= self.chunk_size * 1.2:
                        merged_chunks.append(combined)
                        continue
            merged_chunks.append(piece)

        return merged_chunks

def create_chunks_with_metadata(
    text: str,
    base_metadata: Dict[str, Any],
    chunk_size: int = 900,
    chunk_overlap: int = 150
) -> List[Dict[str, Any]]:
    """Splits text and maps line numbers and base metadata onto chunks."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    raw_chunks = splitter.split_text(text)
    
    result = []
    lines = text.splitlines(keepends=True)
    
    current_char = 0
    for idx, chunk in enumerate(raw_chunks):
        # Calculate approximate line numbers
        start_pos = text.find(chunk[:50], current_char)
        if start_pos == -1:
            start_pos = current_char
        end_pos = start_pos + len(chunk)
        current_char = max(0, start_pos)

        # Count lines
        line_start = text.count("\n", 0, start_pos) + 1
        line_end = text.count("\n", 0, end_pos) + 1

        meta = dict(base_metadata)
        meta["line_start"] = line_start
        meta["line_end"] = line_end

        result.append({
            "chunk_index": idx,
            "content": chunk,
            "metadata": meta
        })

    return result
