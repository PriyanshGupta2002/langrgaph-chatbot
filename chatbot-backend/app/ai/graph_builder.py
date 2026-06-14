from langgraph.graph import StateGraph, START, END
from app.ai.states import ChatState
from app.ai.nodes import chatbot_node


def build_graph(checkpointer):
    builder = StateGraph(ChatState)

    builder.add_node("chatbot_node", chatbot_node)

    builder.add_edge(START, "chatbot_node")
    builder.add_edge("chatbot_node", END)

    graph = builder.compile(checkpointer=checkpointer)
    return graph
