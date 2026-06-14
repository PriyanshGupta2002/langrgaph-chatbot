from pydantic import BaseModel, ConfigDict
from app.database.enums.message_role import MessageRole
from app.database.enums.message_status import MessageStatus
from datetime import datetime


class MessageResponse(BaseModel):
    message_id: str
    content: str
    role: MessageRole
    thread_id: str
    status: MessageStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateMessageRequest(BaseModel):
    content: str
    role: MessageRole
    thread_id: str
    status: MessageStatus
