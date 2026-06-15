from langchain_openrouter import ChatOpenRouter
from dotenv import load_dotenv
from app.ai.tools import tools_list

load_dotenv()
llm = ChatOpenRouter(model="qwen/qwen3.6-flash", temperature=0.4, max_retries=2)

llm_with_tools = llm.bind_tools(tools=tools_list)


async def chatbot_node(state):
    response = await llm_with_tools.ainvoke(state["messages"])

    return {"messages": [response]}
