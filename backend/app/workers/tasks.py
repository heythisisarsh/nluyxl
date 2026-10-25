"""Celery background tasks and Beat scheduler for nluyxl background jobs."""
import os
import time
import logging
from celery import Celery
from celery.schedules import crontab
from app.config import settings

logger = logging.getLogger(__name__)

broker_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
backend_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery = Celery(
    "nluyxl",
    broker=broker_url,
    backend=backend_url,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "check-due-jobs-every-minute": {
            "task": "app.workers.tasks.scan_pending_cron_jobs",
            "schedule": 60.0,
        },
    },
)


@celery.task(name="app.workers.tasks.execute_routine_job")
def execute_routine_job(job_id: str, action_name: str, payload: dict | None = None) -> dict:
    """Executes a routine background job and logs the result."""
    logger.info(f"Executing background job {job_id}: {action_name}")
    start_time = time.time()
    
    # Simulate processing business integration
    time.sleep(1)
    duration = time.time() - start_time
    
    return {
        "status": "success",
        "job_id": job_id,
        "action": action_name,
        "duration_seconds": round(duration, 3),
        "executed_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
    }


@celery.task(name="app.workers.tasks.scan_pending_cron_jobs")
def scan_pending_cron_jobs() -> dict:
    """Scans and triggers scheduled background routines."""
    logger.info("Celery Beat heartbeat: Scanning for active business routines...")
    return {
        "heartbeat": True,
        "checked_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
    }
