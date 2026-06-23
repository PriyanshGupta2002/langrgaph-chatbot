from langchain_openrouter import ChatOpenRouter
from dotenv import load_dotenv
from app.ai.states import ChatState
from app.ai.tools import tools_list

from langchain_core.runnables import RunnableConfig
from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
)

from langgraph.store.base import BaseStore

from pydantic import BaseModel, Field

from typing import List

from app.ai.prompts import (
    MEMORY_PROMPT,
    SYSTEM_PROMPT_TEMPLATE,
)

import hashlib

load_dotenv()

llm = ChatOpenRouter(
    model="qwen/qwen3.6-flash",
    temperature=0.4,
    max_retries=2,
)

memory_model = ChatOpenRouter(
    model="google/gemini-3.5-flash",
    temperature=0.5,
    max_retries=2,
)

llm_with_tools = llm.bind_tools(tools=tools_list)


class MemoryItem(BaseModel):
    is_new: bool
    text: str


class MemoryDecision(BaseModel):
    should_write: bool
    memories: List[MemoryItem] = Field(default_factory=list)


structured_memory_model = memory_model.with_structured_output(MemoryDecision)


def get_memory_namespace(user_id: str):
    return (
        "users",
        str(user_id),
        "memories",
    )


async def remember_node(
    state: ChatState,
    config: RunnableConfig,
    store: BaseStore,
):
    user_id = config["configurable"]["user_id"]

    namespace = get_memory_namespace(user_id)

    last_user_message = next(
        (msg for msg in reversed(state["messages"]) if isinstance(msg, HumanMessage)),
        None,
    )

    if not last_user_message:
        return {}

    last_text = last_user_message.content.strip()

    if not last_text:
        return {}

    stored_memories = await store.asearch(
        namespace,
        limit=50,
    )

    existing_memories = (
        "\n".join(item.value.get("data", "") for item in stored_memories)
        if stored_memories
        else "(empty)"
    )

    memory_prompt_system_message = SystemMessage(
        content=MEMORY_PROMPT.format(user_details_content=existing_memories)
    )

    decision: MemoryDecision = await structured_memory_model.ainvoke(
        [
            memory_prompt_system_message,
            {
                "role": "user",
                "content": last_text,
            },
        ]
    )

    if not decision.should_write:
        return {}

    for memory in decision.memories:
        memory_text = memory.text.strip()

        if not memory.is_new:
            continue

        if not memory_text:
            continue

        memory_key = hashlib.md5(memory_text.lower().encode()).hexdigest()

        await store.aput(
            namespace,
            memory_key,
            {
                "data": memory_text,
            },
        )

    return {}


async def chatbot_node(
    state: ChatState,
    config: RunnableConfig,
    store: BaseStore,
):
    user_id = config["configurable"]["user_id"]

    namespace = get_memory_namespace(user_id)

    memories = await store.asearch(
        namespace,
        limit=50,
    )

    user_details = (
        "\n".join(item.value.get("data", "") for item in memories)
        if memories
        else "(empty)"
    )

    system_message = SystemMessage(
        content=SYSTEM_PROMPT_TEMPLATE.format(
            user_details_content=user_details,
        )
    )

    response = await llm_with_tools.ainvoke([system_message] + state["messages"])

    return {
        "messages": [response],
    }
