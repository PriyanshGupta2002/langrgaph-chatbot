from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.models.Thread import Thread


class ThreadService:

    async def create_thread(
        self,
        db: AsyncSession,
        user_id: int,
        title: str | None = None,
    ) -> Thread:

        thread = Thread(
            user_id=user_id,
            title=title,
        )

        db.add(thread)

        await db.commit()
        await db.refresh(thread)

        return thread

    async def get_thread_by_id(
        self,
        db: AsyncSession,
        thread_id: str,
    ) -> Thread | None:

        result = await db.execute(select(Thread).where(Thread.thread_id == thread_id))

        return result.scalar_one_or_none()

    async def get_user_threads(
        self,
        db: AsyncSession,
        user_id: int,
    ) -> list[Thread]:

        result = await db.execute(
            select(Thread)
            .where(Thread.user_id == user_id)
            .order_by(Thread.created_at.desc())
        )

        return list(result.scalars().all())

    async def update_thread(
        self,
        db: AsyncSession,
        thread_id: str,
        title: str,
    ) -> Thread | None:

        thread = await self.get_thread_by_id(db=db, thread_id=thread_id)
        if not thread:
            return None

        thread.title = title
        await db.commit()
        await db.refresh(thread)

        return thread

    async def delete_thread(
        self,
        db: AsyncSession,
        thread_id: str,
    ) -> bool:

        thread = await self.get_thread_by_id(db=db, thread_id=thread_id)
        if not thread:
            return False

        await db.delete(thread)
        await db.commit()

        return True


thread_service = ThreadService()
