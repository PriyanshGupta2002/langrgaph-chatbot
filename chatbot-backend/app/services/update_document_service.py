from app.database.enums.document_status import DocumentStatus
from app.database.enums.document_status import DocumentStatus
from app.database.models.Documents import Documents
from app.core.celery_database import SessionLocal


class UpdateDocumentStatus:
    def updateDocumentStatus(self, progress: str, docId: int, status: DocumentStatus):
        db = SessionLocal()
        document = db.query(Documents).filter(Documents.document_id == docId).first()
        try:
            if document:
                document.document_stage = status
                document.document_completion_rate = progress
                db.commit()
        finally:
            db.close()


update_document_status = UpdateDocumentStatus()
