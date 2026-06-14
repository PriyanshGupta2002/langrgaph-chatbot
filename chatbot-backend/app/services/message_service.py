from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.models.Message import Messages
from app.database.enums.message_role import MessageRole
from app.database.enums.message_status import MessageStatus


class MessageService:

    async def create_message(
        self,
        db: AsyncSession,
        content: str,
        thread_id: str,
        role: MessageRole,
        status: MessageStatus = MessageStatus.COMPLETED,
    ) -> Messages:
        message = Messages(
            content=content, thread_id=thread_id, status=status, role=role
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return message

    async def get_thread_messages(
        self, db: AsyncSession, thread_id: str
    ) -> list[Messages]:
        print(Messages.__tablename__)
        result = await db.execute(
            select(Messages)
            .where(Messages.thread_id == thread_id)
            .order_by(Messages.created_at.asc())
        )

        return list(result.scalars().all())

    async def update_message(
        self,
        db: AsyncSession,
        message: Messages,
    ) -> Messages:

        await db.commit()
        await db.refresh(message)

        return message


message_service = MessageService()
