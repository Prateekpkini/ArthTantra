"""
ArthTantra — Main Agent Graph
LangGraph StateGraph definition connecting all agents.
"""
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from app.agents.state import AgentState
from app.agents.supervisor import create_supervisor_node
from app.agents.fraud_agent import create_fraud_agent_node
from app.agents.tax_agent import create_tax_agent_node
from app.agents.strategy_agent import create_strategy_agent_node
from app.agents.execution_agent import create_execution_agent_node
from app.config import settings


def get_llm():
    """Get the configured LLM based on settings."""
    if settings.llm_provider == "openai":
        return ChatOpenAI(
            model="gpt-4o",
            api_key=settings.openai_api_key,
            temperature=0.3,
            streaming=True,
        )
    else:
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            google_api_key=settings.google_api_key,
            temperature=0.3,
            convert_system_message_to_human=True,
        )


def route_to_agent(state: AgentState) -> str:
    """Route from supervisor to the appropriate specialist agent."""
    next_agent = state.get("next_agent", "strategy_agent")
    valid = ["fraud_agent", "tax_agent", "strategy_agent", "execution_agent"]
    if next_agent in valid:
        return next_agent
    return "strategy_agent"


def build_agent_graph():
    """Build the complete LangGraph agent graph."""
    llm = get_llm()

    # Create agent nodes
    supervisor = create_supervisor_node(llm)
    fraud_agent = create_fraud_agent_node(llm)
    tax_agent = create_tax_agent_node(llm)
    strategy_agent = create_strategy_agent_node(llm)
    execution_agent = create_execution_agent_node(llm)

    # Build the graph
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("supervisor", supervisor)
    graph.add_node("fraud_agent", fraud_agent)
    graph.add_node("tax_agent", tax_agent)
    graph.add_node("strategy_agent", strategy_agent)
    graph.add_node("execution_agent", execution_agent)

    # Set entry point
    graph.set_entry_point("supervisor")

    # Conditional routing from supervisor
    graph.add_conditional_edges(
        "supervisor",
        route_to_agent,
        {
            "fraud_agent": "fraud_agent",
            "tax_agent": "tax_agent",
            "strategy_agent": "strategy_agent",
            "execution_agent": "execution_agent",
        }
    )

    # All specialist agents end after producing output
    graph.add_edge("fraud_agent", END)
    graph.add_edge("tax_agent", END)
    graph.add_edge("strategy_agent", END)
    graph.add_edge("execution_agent", END)

    # Compile the graph
    compiled = graph.compile()
    return compiled


# Singleton graph instance
_graph = None


def get_graph():
    """Get or create the singleton agent graph."""
    global _graph
    if _graph is None:
        _graph = build_agent_graph()
    return _graph
