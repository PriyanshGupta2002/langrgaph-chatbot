from langchain_core.tools import tool
import requests
from app.core.config import settings
from app.services.retrieval_service import retrieval_service

from app.core.database import AsyncSessionLocal


@tool
def weather_tool(city: str):
    """
    This function fetches the current weather data for a given city
    """

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.WEATHER_API_KEY}"
    response = requests.get(url)

    return response.json()


@tool
async def retrieve_documents(query: str):
    """
    Retrieve relevant information from uploaded documents using semantic search.

    Use this tool whenever answering a question requires information that may
    exist in the document knowledge base. The tool searches indexed document
    chunks using vector similarity and returns the most relevant passages.

    Do not use this tool for general knowledge questions that can be answered
    without consulting uploaded documents.

    Args:
        query: The search query or user question.

    Returns:
        Relevant document excerpts that can be used to answer the question.
    """

    async with AsyncSessionLocal() as db:

        results = await retrieval_service.similarity_search(
            query=query,
            db=db,
            top_k=5,
        )

        return "\n\n".join(results)


tools_list = [weather_tool, retrieve_documents]
