from celery import Celery
import app.database.models

celery_app = Celery(
    "chatbot",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]

celery_app.autodiscover_tasks(
    ["app.worker"],
    force=True,
)


celery_app.conf.imports = ("app.worker.document_tasks",)
