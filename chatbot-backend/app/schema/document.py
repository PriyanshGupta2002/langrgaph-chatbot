from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.database.enums.document_status import DocumentStatus


class DocumentResponse(BaseModel):
    document_id: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    document_url: str
    document_name: str
    document_stage: DocumentStatus
    document_completion_rate: int
    model_config = ConfigDict(from_attributes=True)


class UploadDocumentRequest(BaseModel):
    document_name: str
    document_url: str
