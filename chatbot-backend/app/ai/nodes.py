from langchain_openrouter import ChatOpenRouter
from dotenv import load_dotenv

load_dotenv()
llm = ChatOpenRouter(model="qwen/qwen3.6-flash", temperature=0.4, max_retries=2)


async def chatbot_node(state):
    response = await llm.ainvoke(state["messages"])

    return {"messages": [response]}
