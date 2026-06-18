from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update


from app.database.models.Documents import Documents
from app.database.enums.document_status import DocumentStatus


class DocumentUploadService:
    async def upload_document(
        self, db: AsyncSession, document_name: str, document_url: str, user_id: int
    ):
        document = Documents(
            document_name=document_name,
            document_url=document_url,
            user_id=user_id,
        )
        db.add(document)
        await db.commit()
        await db.refresh(document)
        return document

    async def fetch_documents(self, db: AsyncSession, user_id: int):
        results = await db.execute(
            select(Documents)
            .where(Documents.user_id == user_id)
            .order_by(Documents.created_at.desc())
        )
        return results.scalars().all()

    async def fetch_document_status(
        self,
        db: AsyncSession,
        document_id: str,
        user_id: int,
    ):
        result = await db.execute(
            select(Documents).where(
                Documents.document_id == document_id,
                Documents.user_id == user_id,
            )
        )

        return result.scalar_one_or_none()


upload_doc_service = DocumentUploadService()
