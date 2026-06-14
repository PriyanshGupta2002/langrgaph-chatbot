from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schema.thread import CreateThreadRequest
from app.core.database import get_db
from app.services.thread_service import thread_service
from app.core.dependencies import get_current_user
from app.schema.response import ResponseModel
from app.services.message_service import message_service
from app.schema.thread import ThreadResponse
from app.schema.message import MessageResponse
from pydantic import BaseModel

router = APIRouter(prefix="/threads", tags=["Threads"])


class UpdateThreadRequest(BaseModel):
    title: str


@router.post("/", response_model=ResponseModel)
async def create_new_thread(
    payload: CreateThreadRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread = await thread_service.create_thread(
        db=db, user_id=current_user["user_id"], title=payload.title
    )
    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found",
        )
    thread_data = ThreadResponse.model_validate(thread)
    return ResponseModel(
        success=True,
        message="Thread created successfully",
        data=thread_data,
    )


@router.get("/", response_model=ResponseModel)
async def get_all_threads(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    threads = await thread_service.get_user_threads(
        db=db, user_id=current_user["user_id"]
    )

    thread_data = [ThreadResponse.model_validate(thread) for thread in threads]
    return ResponseModel(
        success=True,
        message="Threads fetched successfully",
        data=thread_data,
    )


@router.get("/{thread_id}", response_model=ResponseModel)
async def get_thread_by_id(
    thread_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):

    thread = await thread_service.get_thread_by_id(db=db, thread_id=thread_id)
    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found",
        )
    if thread.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized",
        )
    thread_data = ThreadResponse.model_validate(thread)
    return ResponseModel(
        success=True,
        message="Thread fetched successfully",
        data=thread_data,
    )


@router.get("/{thread_id}/messages", response_model=ResponseModel)
async def get_thread_by_id(
    thread_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    messages = await message_service.get_thread_messages(db=db, thread_id=thread_id)
    if not messages:
        raise HTTPException(
            status_code=404,
            detail="Thread not found",
        )
    message_data = [MessageResponse.model_validate(message) for message in messages]

    return ResponseModel(
        success=True,
        message="Messages fetched successfully",
        data=message_data,
    )


@router.put("/{thread_id}", response_model=ResponseModel)
async def update_thread(
    thread_id: str,
    payload: UpdateThreadRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread = await thread_service.get_thread_by_id(db=db, thread_id=thread_id)
    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found",
        )
    if thread.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized",
        )

    updated_thread = await thread_service.update_thread(
        db=db, thread_id=thread_id, title=payload.title
    )
    if not updated_thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found",
        )

    thread_data = ThreadResponse.model_validate(updated_thread)
    return ResponseModel(
        success=True,
        message="Thread updated successfully",
        data=thread_data,
    )


@router.delete("/{thread_id}", response_model=ResponseModel)
async def delete_thread(
    thread_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread = await thread_service.get_thread_by_id(db=db, thread_id=thread_id)
    if not thread:
        raise HTTPException(
            status_code=404,
            detail="Thread not found",
        )
    if thread.user_id != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized",
        )

    deleted = await thread_service.delete_thread(db=db, thread_id=thread_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Thread not found",
        )

    return ResponseModel(
        success=True,
        message="Thread deleted successfully",
        data=None,
    )
