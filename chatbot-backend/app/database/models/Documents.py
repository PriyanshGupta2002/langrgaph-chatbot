from sqlalchemy import (
    Integer,
    String,
    Column,
    DateTime,
    func,
    ForeignKey,
    Enum as SqlEnum,
)
from app.core.database import Base
import uuid
from app.database.enums.document_status import DocumentStatus
from sqlalchemy import Text


class Documents(Base):
    __tablename__ = "documents"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    document_name = Column(String(36), nullable=False)
    document_stage = Column(SqlEnum(DocumentStatus), default=DocumentStatus.PROCESSING)
    document_completion_rate = Column(Integer, default=0)
    document_url = Column(Text, nullable=False)
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
