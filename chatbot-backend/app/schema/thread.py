from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ThreadResponse(BaseModel):
    thread_id: str
    title: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateThreadRequest(BaseModel):
    title: str | None = None
