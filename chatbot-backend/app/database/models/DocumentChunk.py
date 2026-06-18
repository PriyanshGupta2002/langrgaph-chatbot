from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, Text, ForeignKey, func, DateTime
from app.core.database import Base
import uuid


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    chunk_id = Column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    document_id = Column(
        String(36),
        ForeignKey("documents.document_id"),
        nullable=False,
    )

    content = Column(Text, nullable=False)

    embedding = Column(Vector(1536))  # OpenAI text-embedding-3-small
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
