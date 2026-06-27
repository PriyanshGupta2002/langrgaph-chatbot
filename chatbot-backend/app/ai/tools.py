from langchain_core.tools import tool
import requests
from app.core.config import settings
from app.services.retrieval_service import retrieval_service

from app.core.database import AsyncSessionLocal
from pydantic import BaseModel, Field
from langchain_openrouter import ChatOpenRouter
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from app.ai.prompts import DOC_EVALUATE_PROMPT, QUERY_REWRITE_PROMPT
from typing import List
import re
import uuid
import asyncio
import logging
from langsmith import traceable
from langchain_tavily import TavilySearch

load_dotenv()

logger = logging.getLogger(__name__)

UPPER_THRESHOLD = 0.7
LOWER_THRESHOLD = 0.3
TOP_K = 5
MAX_REFINED_DOCS = 3
MAX_WEB_DOCS = 3  # cap web results fed into refinement, mirrors MAX_REFINED_DOCS
MAX_CONCURRENCY = 5  # caps parallel LLM calls; tune to your rate limits

web_search_tool = TavilySearch(max_results=5)


class RewrittenQuery(BaseModel):
    rewritten_query: str
    reasoning: str = Field(
        ...,
        description="Short reason the query was rewritten this way (for tracing/debugging)",
    )


class EvalEachDocState(BaseModel):
    score: float = Field(
        ...,
        description="This field will store the score for each retreived page content from the document",
        gt=0,
        lt=1,
    )
    reason: str = Field(
        ..., description="This field will store a short reason why the score was given"
    )


class KeepOrDrop(BaseModel):
    keep: bool


llm = ChatOpenRouter(
    model="openai/gpt-5.3-chat",
    temperature=0.4,
    max_retries=2,
)

doc_eval_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", DOC_EVALUATE_PROMPT),
        ("human", "Question {question} \n\n Chunk {chunk}"),
    ]
)
evaluator_llm = llm.with_structured_output(EvalEachDocState)
eval_chain = doc_eval_prompt | evaluator_llm

rewrite_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", QUERY_REWRITE_PROMPT),
        ("human", "{question}"),
    ]
)
structured_rewriter = llm.with_structured_output(RewrittenQuery)
rewrite_chain = rewrite_prompt | structured_rewriter

filter_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a strict relevance filter.\n"
            "Return keep=true only if the sentence directly helps answer the question.\n"
            "Use ONLY the sentence. Output JSON only.",
        ),
        ("human", "Question: {question}\n\nSentence:\n{sentence}"),
    ]
)
filter_chain = filter_prompt | llm.with_structured_output(KeepOrDrop)


@traceable(name="Rewrite Query", run_type="chain")
async def rewrite_query(question: str) -> RewrittenQuery:
    result = await rewrite_chain.ainvoke(
        {"question": question},
        config={"run_id": uuid.uuid4()},
    )
    logger.debug(
        "Query rewritten: %r -> %r (%s)",
        question,
        result.rewritten_query,
        result.reasoning,
    )
    return result


@traceable(name="Evaluate each document", run_type="chain")
async def evaluate_each_document(question: str, doc: str) -> EvalEachDocState:
    # Each call gets its own run_id so concurrent invocations of the
    # same chain don't race on the LangSmith tracer's internal run_map.
    return await eval_chain.ainvoke(
        {"question": question, "chunk": doc},
        config={"run_id": uuid.uuid4()},
    )


def decompose_to_sentences(text: str) -> List[str]:
    text = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if len(s.strip()) > 20]


async def web_search(question: str) -> List[str]:
    """
    Run a web search via Tavily and return formatted doc strings.
    Degrades gracefully (returns []) on malformed or empty responses
    instead of raising, since this is itself a corrective fallback path.
    """
    try:
        results = await web_search_tool.ainvoke({"query": question})
    except Exception:
        logger.exception("Web search failed for query: %r", question)
        return []

    if not isinstance(results, dict):
        logger.warning("Unexpected web search response type: %r", type(results))
        return []

    raw_results = results.get("results") or []

    web_docs = []
    for r in raw_results[:MAX_WEB_DOCS]:
        title = r.get("title", "")
        url = r.get("url", "")
        content = r.get("content", "") or r.get("snippet", "")
        web_docs.append(f"TITLE: {title}\nURL: {url}\nCONTENT:\n{content}")

    return web_docs


@traceable(name="Knowledge Strip Refinement", run_type="chain")
async def refine(question: str, good_text: List[str]) -> str:
    joined_context = "\n\n".join(good_text).strip()
    sentences = decompose_to_sentences(joined_context)

    if not sentences:
        return ""

    evaluations = await filter_chain.abatch(
        [{"question": question, "sentence": sentence} for sentence in sentences],
        config=[
            {"run_id": uuid.uuid4(), "max_concurrency": MAX_CONCURRENCY}
            for _ in sentences
        ],
    )

    kept = [sentence for sentence, result in zip(sentences, evaluations) if result.keep]
    return "\n".join(kept)


@tool
def weather_tool(city: str):
    """
    This function fetches the current weather data for a given city
    """
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.WEATHER_API_KEY}"
    response = requests.get(url)
    return response.json()


@tool
@traceable(name="CRAG Retriever", run_type="tool")
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
            top_k=TOP_K,
        )

        if not results:
            # No local docs at all -> skip straight to web search correction.
            rewrite = await rewrite_query(question=query)
            web_docs = await web_search(question=rewrite.rewritten_query)
            return await refine(question=query, good_text=web_docs) or "No answer found"

        semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

        async def _bounded_eval(doc: str):
            async with semaphore:
                return await evaluate_each_document(question=query, doc=doc)

        evaluations = await asyncio.gather(*[_bounded_eval(doc) for doc in results])

        evaluated_docs = sorted(
            (
                {"doc": doc, "score": ev.score, "reason": ev.reason}
                for doc, ev in zip(results, evaluations)
            ),
            key=lambda x: x["score"],
            reverse=True,
        )

        best_score = evaluated_docs[0]["score"]
        good_docs = [
            item["doc"] for item in evaluated_docs if item["score"] >= UPPER_THRESHOLD
        ][:MAX_REFINED_DOCS]

        if best_score >= UPPER_THRESHOLD:
            refined_context = await refine(question=query, good_text=good_docs)

        elif best_score >= LOWER_THRESHOLD:
            rewrite = await rewrite_query(question=query)
            web_docs = await web_search(question=rewrite.rewritten_query)
            refined_context = await refine(
                question=query, good_text=good_docs + web_docs
            )

        else:
            rewrite = await rewrite_query(question=query)
            web_docs = await web_search(question=rewrite.rewritten_query)
            refined_context = await refine(question=query, good_text=web_docs)

        logger.debug("refined_context: %s", refined_context)
        return refined_context or "No answer found"


tools_list = [weather_tool, retrieve_documents, web_search_tool]
