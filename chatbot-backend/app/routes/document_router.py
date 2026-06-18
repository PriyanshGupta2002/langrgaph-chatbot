from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schema.response import ResponseModel
from app.schema.document import UploadDocumentRequest, DocumentResponse
from app.services.document_service import upload_doc_service
from app.worker.document_tasks import process_document_pipeline

router = APIRouter(prefix="/docs", tags=["Upload Document"])


@router.post("/upload", response_model=ResponseModel)
async def insert_doc(
    payload: UploadDocumentRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = await upload_doc_service.upload_document(
        db=db,
        document_name=payload.document_name,
        document_url=payload.document_url,
        user_id=current_user["user_id"],
    )
    if not document:
        return HTTPException(status_code=400, detail="Cannot upload document")
    document_data = DocumentResponse.model_validate(document)
    process_document_pipeline(document_id=document_data.document_id)
    return ResponseModel(
        success=True,
        message="Document uploaded successfully",
        data=document_data,
    )


@router.get("/fetch-documents", response_model=ResponseModel)
async def fetch_documents(current_user=Depends(get_current_user), db=Depends(get_db)):
    documents = await upload_doc_service.fetch_documents(
        db=db, user_id=current_user["user_id"]
    )
    document_data = [
        DocumentResponse.model_validate(document) for document in documents
    ]
    return ResponseModel(
        success=True, message="Documents fetched successfully", data=document_data
    )


@router.get("/{document_id}/status")
async def get_document_status(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = await upload_doc_service.fetch_document_status(
        db=db,
        document_id=document_id,
        user_id=current_user["user_id"],
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return ResponseModel(
        success=True,
        message="Document status fetched successfully",
        data={
            "document_id": document.document_id,
            "document_stage": document.document_stage,
            "document_completion_rate": document.document_completion_rate,
        },
    )
