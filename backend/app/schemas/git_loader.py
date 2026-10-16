from typing import Optional, List
from pydantic import BaseModel, Field

class GitIngestRequest(BaseModel):
    repo_url: str = Field(..., description="Remote Git repository URL (e.g. https://github.com/owner/repo)")
    branch: Optional[str] = Field(default=None, description="Specific branch, tag, or commit to clone (defaults to repo default branch)")
    file_extensions: Optional[List[str]] = Field(
        default=None,
        description="Filter extensions: ['.py', '.ts', '.tsx', '.js', '.jsx', '.md', '.go', '.rs', '.java', '.cpp', '.sql', '.yaml', '.json']"
    )
    access_token: Optional[str] = Field(default=None, description="Optional private repository personal access token")
    name: Optional[str] = Field(default=None, description="Custom name for the ingested codebase repository")
