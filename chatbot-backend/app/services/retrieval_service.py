from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.DocumentChunk import DocumentChunk
from app.services.embedding_service import embedding_service


class RetrievalService:

    async def similarity_search(
        self,
        query: str,
        db: AsyncSession,
        top_k: int = 5,
    ):
        query_embedding = embedding_service.embed_query(query)

        stmt = (
            select(DocumentChunk.content)
            .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
            .limit(top_k)
        )

        result = await db.execute(stmt)

        return result.scalars().all()


retrieval_service = RetrievalService()
