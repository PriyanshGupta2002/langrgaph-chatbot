from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schema.chat import ChatRequest
from app.schema.response import ResponseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.services.chat_service import chat_service
from fastapi.responses import StreamingResponse

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)


@router.post("/", response_model=ResponseModel)
async def chat(
    payload: ChatRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    try:

        result = await chat_service.send_message(
            db=db,
            user_id=current_user["user_id"],
            thread_id=payload.thread_id,
            message=payload.message,
        )

        return ResponseModel(
            success=True,
            message="Message sent successfully",
            data=result,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post("/stream")
async def stream_chat(
    payload: ChatRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return StreamingResponse(
        await chat_service.stream_message(
            db=db,
            user_id=current_user["user_id"],
            thread_id=payload.thread_id,
            message=payload.message,
        ),
        media_type="text/event-stream",
    )
