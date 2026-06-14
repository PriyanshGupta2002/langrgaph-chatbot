from app.services.message_service import message_service
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.thread_service import thread_service
from app.database.enums.message_role import MessageRole
from app.database.enums.message_status import MessageStatus
from app.schema.thread import ThreadResponse
from app.schema.message import MessageResponse
from app.schema.chat import ChatResponse
import app.ai.graph as graph_store
import app.ai.checkpointer as checkpointer_store
from langchain_core.messages import HumanMessage
from app.database.enums import message_status
from app.database.enums import message_role


class ChatService:
    async def _save_chat_to_db(
        self,
        db: AsyncSession,
        status: MessageStatus,
        role: MessageRole,
        message: str,
        thread_id: str,
    ):
        message_user_assistant = await message_service.create_message(
            db=db, content=message, role=role, status=status, thread_id=thread_id
        )
        db.add(message_user_assistant)
        await db.commit()

    async def _event_generator(
        self,
        db: AsyncSession,
        thread_id: str,
        message: str,
    ):
        full_response = ""
        async for event in graph_store.graph.astream(
            {"messages": [HumanMessage(content=message)]},
            config={"configurable": {"thread_id": thread_id}},
            version="v2",
            stream_mode=["messages"],
        ):

            if event["type"] == "messages":
                message_chunk, metadata = event["data"]
                if message_chunk.content:
                    token = message_chunk.content
                    full_response += token
                    yield f"data: {token}\n\n"

        await self._save_chat_to_db(
            db=db,
            message=full_response,
            role=MessageRole.ASSISTANT,
            status=MessageStatus.COMPLETED,
            thread_id=thread_id,
        )
        yield "event: done\ndata: complete\n\n"

    async def send_message(
        self, db: AsyncSession, user_id: int, thread_id: str, message: str
    ):
        thread = await thread_service.get_thread_by_id(db=db, thread_id=thread_id)
        if not thread:
            raise ValueError("Thread not found")
        if thread.user_id != user_id:
            raise ValueError("Unauthorized")

        user_message = await message_service.create_message(
            db,
            thread_id=thread_id,
            content=message,
            role=MessageRole.USER,
            status=MessageStatus.COMPLETED,
        )
        db.add(user_message)
        await db.commit()
        await db.refresh(user_message)

        result = await graph_store.graph.ainvoke(
            {"messages": [HumanMessage(content=message)]},
            config={"configurable": {"thread_id": thread_id}},
        )
        print(graph_store.graph)
        print(checkpointer_store.checkpointer)

        assistant_response = result["messages"][-1].content
        assistant_message = await message_service.create_message(
            db,
            thread_id=thread_id,
            content=assistant_response,
            role=MessageRole.ASSISTANT,
            status=MessageStatus.COMPLETED,
        )
        db.add(assistant_message)
        await db.commit()
        await db.refresh(user_message)

        return ChatResponse(
            thread=ThreadResponse.model_validate(thread),
            user_message=MessageResponse.model_validate(user_message),
            assistant_message=MessageResponse.model_validate(assistant_message),
        )

    async def stream_message(
        self, db: AsyncSession, user_id: int, thread_id: str, message: str
    ):
        thread = await thread_service.get_thread_by_id(db=db, thread_id=thread_id)
        if not thread:
            raise ValueError("Thread not found")
        if thread.user_id != user_id:
            raise ValueError("Unauthorized")

        await self._save_chat_to_db(
            db=db,
            thread_id=thread_id,
            message=message,
            role=MessageRole.USER,
            status=MessageStatus.COMPLETED,
        )

        return self._event_generator(
            db=db,
            thread_id=thread_id,
            message=message,
        )


chat_service = ChatService()
