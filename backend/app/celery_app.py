import logging
from app.config import settings

logger = logging.getLogger(__name__)

try:
    from celery import Celery

    celery_app = Celery(
        "docsupport",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL,
        include=["app.tasks.ingestion_tasks"]
    )

    celery_app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_time_limit=600,
        broker_connection_retry_on_startup=True
    )
except ImportError:
    logger.warning("Celery is not installed in the local environment. Using threaded background task dispatcher.")

    class MockCeleryTask:
        def __init__(self, fn):
            self.fn = fn
        def delay(self, *args, **kwargs):
            import threading
            thread = threading.Thread(target=self.fn, args=args, kwargs=kwargs)
            thread.daemon = True
            thread.start()
        def __call__(self, *args, **kwargs):
            return self.fn(*args, **kwargs)

    class MockCelery:
        def task(self, *args, **kwargs):
            def decorator(fn):
                return MockCeleryTask(fn)
            return decorator

    celery_app = MockCelery()
