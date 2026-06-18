from sqlalchemy.orm import Session
from app.database.models.DocumentChunk import DocumentChunk


class VectorStoreService:

    def store_chunks(
        self,
        db: Session,
        document_id: str,
        chunks,
        embeddings,
    ):
        for chunk, embedding in zip(chunks, embeddings):

            db.add(
                DocumentChunk(
                    document_id=document_id,
                    content=chunk.page_content,
                    embedding=embedding,
                )
            )

        db.commit()


vector_store_service = VectorStoreService()
