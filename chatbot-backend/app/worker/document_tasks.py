from celery import chain
from langchain_core.documents import Document

from app.worker.celery_app import celery_app
from app.core.celery_database import SessionLocal

from app.services.document_loader_service import document_service
from app.services.create_chunk_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store_service
from app.services.update_document_service import update_document_status

from app.database.enums.document_status import DocumentStatus


@celery_app.task(bind=True, max_retries=3)
def load_documents_task(self, document_id: str):
    db = SessionLocal()

    try:
        update_document_status.updateDocumentStatus(
            docId=document_id,
            progress=10,
            status=DocumentStatus.PROCESSING,
        )

        docs = document_service.load_documents(
            db=db,
            doc_id=document_id,
        )

        serialized_docs = [
            {
                "page_content": doc.page_content,
                "metadata": doc.metadata,
            }
            for doc in docs
        ]

        return {
            "document_id": document_id,
            "docs": serialized_docs,
        }

    except Exception as e:
        update_document_status.updateDocumentStatus(
            docId=document_id,
            progress=0,
            status=DocumentStatus.FAILED,
        )

        raise self.retry(exc=e, countdown=5)

    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3)
def chunk_documents_task(self, data):
    db = SessionLocal()

    try:
        document_id = data["document_id"]

        update_document_status.updateDocumentStatus(
            docId=document_id,
            progress=40,
            status=DocumentStatus.PROCESSING,
        )

        docs = [
            Document(
                page_content=doc["page_content"],
                metadata=doc["metadata"],
            )
            for doc in data["docs"]
        ]

        chunked_docs = chunking_service.chunk_documents(
            docs=docs,
        )

        serialized_chunks = [
            {
                "page_content": chunk.page_content,
                "metadata": chunk.metadata,
            }
            for chunk in chunked_docs
        ]

        return {
            "document_id": document_id,
            "chunked_docs": serialized_chunks,
        }

    except Exception as e:
        update_document_status.updateDocumentStatus(
            docId=data["document_id"],
            progress=0,
            status=DocumentStatus.FAILED,
        )

        raise self.retry(exc=e, countdown=5)

    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3)
def create_embeddings_task(self, data):
    db = SessionLocal()

    try:
        document_id = data["document_id"]

        update_document_status.updateDocumentStatus(
            docId=document_id,
            progress=70,
            status=DocumentStatus.PROCESSING,
        )

        chunked_docs = data["chunked_docs"]

        texts = [chunk["page_content"] for chunk in chunked_docs]

        embeddings = embedding_service.embed_documents(
            texts=texts,
        )

        serialized_embeddings = [list(embedding) for embedding in embeddings]

        return {
            "document_id": document_id,
            "chunked_docs": chunked_docs,
            "embeddings": serialized_embeddings,
        }

    except Exception as e:
        update_document_status.updateDocumentStatus(
            docId=data["document_id"],
            progress=0,
            status=DocumentStatus.FAILED,
        )

        raise self.retry(exc=e, countdown=5)

    finally:
        db.close()


@celery_app.task(bind=True, max_retries=3)
def store_embeddings_to_vector_db_task(self, data):
    db = SessionLocal()

    try:
        document_id = data["document_id"]

        update_document_status.updateDocumentStatus(
            docId=document_id,
            progress=90,
            status=DocumentStatus.PROCESSING,
        )

        chunks_docs_langchain = [
            Document(
                page_content=chunk["page_content"],
                metadata=chunk["metadata"],
            )
            for chunk in data["chunked_docs"]
        ]

        vector_store_service.store_chunks(
            db=db,
            document_id=document_id,
            chunks=chunks_docs_langchain,
            embeddings=data["embeddings"],
        )

        update_document_status.updateDocumentStatus(
            docId=document_id,
            progress=100,
            status=DocumentStatus.COMPLETED,
        )

        return {
            "document_id": document_id,
            "status": "completed",
        }

    except Exception as e:
        update_document_status.updateDocumentStatus(
            docId=data["document_id"],
            progress=0,
            status=DocumentStatus.FAILED,
        )

        raise self.retry(exc=e, countdown=5)

    finally:
        db.close()


def process_document_pipeline(document_id: str):

    workflow = chain(
        load_documents_task.s(document_id),
        chunk_documents_task.s(),
        create_embeddings_task.s(),
        store_embeddings_to_vector_db_task.s(),
    )

    workflow.apply_async()
