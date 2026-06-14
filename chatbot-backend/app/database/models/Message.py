from sqlalchemy import (
    Integer,
    String,
    Column,
    ForeignKey,
    DateTime,
    func,
    Enum as SqlEnum,
)
from app.core.database import Base
import uuid
from app.database.enums.message_role import MessageRole
from app.database.enums.message_status import MessageStatus
from sqlalchemy.orm import relationship


class Messages(Base):
    __tablename__ = "messages"
    message_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    content = Column(String, nullable=False)
    role = Column(SqlEnum(MessageRole), nullable=False)
    thread_id = Column(String, ForeignKey("threads.thread_id"))
    status = Column(SqlEnum(MessageStatus), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    thread = relationship("Thread", back_populates="messages")
