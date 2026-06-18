from langchain_text_splitters import RecursiveCharacterTextSplitter


class ChunkingService:
    def chunk_documents(self, docs):
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        return splitter.split_documents(docs)


chunking_service = ChunkingService()
