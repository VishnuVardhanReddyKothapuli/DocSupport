import os
import shutil
import tempfile
import subprocess
import logging
from typing import List, Dict, Any, Optional, Set
from pathlib import Path
from urllib.parse import urlparse, urlunparse

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document as LCDocument

logger = logging.getLogger(__name__)

DEFAULT_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".md",
    ".rs", ".go", ".java", ".cpp", ".c", ".h", ".hpp",
    ".sql", ".yaml", ".yml", ".json", ".html", ".css", ".sh"
}

IGNORED_DIRECTORIES = {
    ".git", ".github", "node_modules", "vendor", "venv", ".venv",
    "__pycache__", "dist", "build", "target", "bin", "obj",
    ".next", ".nuxt", "out", "coverage", ".pytest_cache"
}

IGNORED_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock",
    "Cargo.lock", "go.sum", "composer.lock", "Gemfile.lock",
    ".DS_Store", "Thumbs.db"
}

EXTENSION_LANGUAGE_MAP = {
    ".py": "python",
    ".ts": "typescript",
    ".tsx": "typescript-react",
    ".js": "javascript",
    ".jsx": "javascript-react",
    ".md": "markdown",
    ".rs": "rust",
    ".go": "go",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".sql": "sql",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".json": "json",
    ".html": "html",
    ".css": "css",
    ".sh": "bash"
}

class GitLoaderService:
    def __init__(
        self,
        repo_url: str,
        branch: Optional[str] = None,
        file_extensions: Optional[List[str]] = None,
        access_token: Optional[str] = None,
        max_file_size_bytes: int = 1024 * 1024  # 1 MB
    ):
        self.repo_url = repo_url.strip()
        self.branch = branch.strip() if branch else None
        self.access_token = access_token.strip() if access_token else None
        self.max_file_size_bytes = max_file_size_bytes
        
        if file_extensions:
            self.allowed_extensions = {ext.lower() if ext.startswith(".") else f".{ext.lower()}" for ext in file_extensions}
        else:
            self.allowed_extensions = DEFAULT_EXTENSIONS

    def _prepare_clone_url(self) -> str:
        """Injects personal access token into HTTPS URL if provided."""
        if not self.access_token:
            return self.repo_url

        try:
            parsed = urlparse(self.repo_url)
            if parsed.scheme in ["http", "https"]:
                netloc = f"x-access-token:{self.access_token}@{parsed.hostname}"
                if parsed.port:
                    netloc += f":{parsed.port}"
                return urlunparse((parsed.scheme, netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))
        except Exception as e:
            logger.warning(f"Failed to inject access token into URL: {e}")
            
        return self.repo_url

    def _clone_repository(self, target_dir: str) -> str:
        """Executes shallow clone with depth=1 and retrieves latest commit hash."""
        clone_url = self._prepare_clone_url()
        clone_cmd = ["git", "clone", "--depth", "1"]
        
        if self.branch:
            clone_cmd.extend(["--branch", self.branch])
            
        clone_cmd.extend([clone_url, target_dir])
        
        # Avoid hanging on interactive git credential prompts
        env = os.environ.copy()
        env["GIT_TERMINAL_PROMPT"] = "0"
        
        logger.info(f"Cloning repository {self.repo_url} (branch: {self.branch or 'default'})...")
        res = subprocess.run(
            clone_cmd,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=120
        )
        if res.returncode != 0:
            err_msg = res.stderr.strip() or res.stdout.strip()
            raise RuntimeError(f"Git clone failed: {err_msg}")

        # Retrieve commit hash
        hash_res = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=target_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=10
        )
        commit_hash = hash_res.stdout.strip() if hash_res.returncode == 0 else "unknown"
        return commit_hash

    def _is_binary_file(self, file_path: Path) -> bool:
        """Check if file contains null bytes indicative of binary data."""
        try:
            with open(file_path, "tr") as check_file:
                check_file.read(1024)
                return False
        except UnicodeDecodeError:
            return True
        except Exception:
            return True

    def _should_index_file(self, file_path: Path, rel_path: str) -> bool:
        """Check if file matches allowed extensions, sizes, and exclusions."""
        # Check ignored file names
        if file_path.name in IGNORED_FILES:
            return False
            
        # Check minified assets
        if ".min." in file_path.name or "-min." in file_path.name:
            return False

        # Check extensions
        ext = file_path.suffix.lower()
        if ext not in self.allowed_extensions:
            return False

        # Check file size
        try:
            if file_path.stat().st_size > self.max_file_size_bytes:
                logger.info(f"Skipping {rel_path}: file size exceeds 1MB limit.")
                return False
        except Exception:
            return False

        # Check binary
        if self._is_binary_file(file_path):
            return False

        return True

    def process_repository(self) -> Dict[str, Any]:
        """
        Clones repository, filters files, generates code-context chunks,
        and guarantees cleanup in a finally block.
        """
        temp_dir = tempfile.mkdtemp(prefix="git_loader_")
        commit_hash = "unknown"
        chunks_output: List[Dict[str, Any]] = []
        files_indexed: List[str] = []

        try:
            commit_hash = self._clone_repository(temp_dir)
            splitter = RecursiveCharacterTextSplitter(chunk_size=900, chunk_overlap=150)

            # Traverse directory
            for root, dirs, files in os.walk(temp_dir):
                # Filter out ignored directories in-place
                dirs[:] = [d for d in dirs if d not in IGNORED_DIRECTORIES and not d.startswith(".")]

                for file in files:
                    full_path = Path(root) / file
                    rel_path = str(full_path.relative_to(temp_dir)).replace("\\", "/")

                    if not self._should_index_file(full_path, rel_path):
                        continue

                    try:
                        with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                            content = f.read()

                        if not content.strip():
                            continue

                        files_indexed.append(rel_path)
                        ext = full_path.suffix.lower()
                        language = EXTENSION_LANGUAGE_MAP.get(ext, "text")

                        # Split file into chunks
                        file_chunks = splitter.split_text(content)
                        lines = content.splitlines()

                        current_pos = 0
                        for c_idx, raw_chunk in enumerate(file_chunks):
                            # Calculate line numbers
                            found_idx = content.find(raw_chunk[:50], current_pos)
                            if found_idx == -1:
                                found_idx = current_pos
                            end_idx = found_idx + len(raw_chunk)
                            current_pos = max(0, found_idx)

                            line_start = content.count("\n", 0, found_idx) + 1
                            line_end = content.count("\n", 0, end_idx) + 1

                            # Prepend architectural code context header
                            comment_prefix = "//" if ext not in [".py", ".sh", ".yaml", ".yml"] else "#"
                            context_header = f"{comment_prefix} File: {rel_path} | Lines {line_start}-{line_end} | Language: {language}\n"
                            chunk_content_with_header = f"{context_header}{raw_chunk}"

                            chunk_meta = {
                                "file_path": rel_path,
                                "file_name": full_path.name,
                                "language": language,
                                "line_start": line_start,
                                "line_end": line_end,
                                "total_file_lines": len(lines),
                                "git_commit_hash": commit_hash,
                                "source_url": self.repo_url
                            }

                            chunks_output.append({
                                "chunk_index": len(chunks_output),
                                "content": chunk_content_with_header,
                                "metadata": chunk_meta
                            })

                    except Exception as fe:
                        logger.warning(f"Error processing file {rel_path}: {fe}")

        finally:
            # Guarantee cleanup to prevent disk exhaustion
            if os.path.exists(temp_dir):
                try:
                    shutil.rmtree(temp_dir, ignore_errors=True)
                    logger.info(f"Cleaned up temporary GitLoader directory {temp_dir}")
                except Exception as ce:
                    logger.warning(f"Failed to remove temp dir {temp_dir}: {ce}")

        return {
            "commit_hash": commit_hash,
            "branch": self.branch or "default",
            "files_indexed": files_indexed,
            "chunks": chunks_output
        }
