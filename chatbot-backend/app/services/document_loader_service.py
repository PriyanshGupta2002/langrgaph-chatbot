from langchain_community.document_loaders import PyPDFLoader
from sqlalchemy.orm import Session

from app.database.models.Documents import Documents


class DocumentLoaderService:

    def load_documents(
        self,
        db: Session,
        doc_id: str,
    ):
        document = db.query(Documents).filter(Documents.document_id == doc_id).first()

        if not document:
            raise ValueError(f"Document {doc_id} not found")

        loader = PyPDFLoader(document.document_url)

        docs = loader.load()

        return docs


document_service = DocumentLoaderService()
