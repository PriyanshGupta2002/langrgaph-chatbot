from pydantic import BaseModel, ConfigDict
from app.schema.thread import ThreadResponse
from app.schema.message import MessageResponse


class ChatRequest(BaseModel):
    thread_id: str
    message: str


class ChatResponse(BaseModel):
    thread: ThreadResponse
    user_message: MessageResponse
    assistant_message: MessageResponse
    model_config = ConfigDict(from_attributes=True)
