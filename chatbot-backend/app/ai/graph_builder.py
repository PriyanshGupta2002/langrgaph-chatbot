from langgraph.graph import StateGraph, START, END
from app.ai.states import ChatState
from app.ai.nodes import chatbot_node, remember_node
from app.ai.tools import tools_list
from langgraph.prebuilt import ToolNode, tools_condition


def build_graph(checkpointer, store):
    tool_node = ToolNode(tools=tools_list)
    builder = StateGraph(ChatState)

    builder.add_node("chatbot_node", chatbot_node)
    builder.add_node("remember_node", remember_node)
    builder.add_node("tools", tool_node)

    builder.add_edge(START, "remember_node")
    builder.add_edge("remember_node", "chatbot_node")
    builder.add_conditional_edges("chatbot_node", tools_condition)
    builder.add_edge("tools", "chatbot_node")

    graph = builder.compile(checkpointer=checkpointer, store=store)
    return graph
