from app.tasks.ingestion_tasks import (
    ingest_git_repo_task,
    ingest_text_task,
    ingest_web_task,
    ingest_youtube_task,
    dispatch_task
)

__all__ = [
    "ingest_git_repo_task",
    "ingest_text_task",
    "ingest_web_task",
    "ingest_youtube_task",
    "dispatch_task"
]
