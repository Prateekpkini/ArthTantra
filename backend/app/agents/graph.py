"""
ArthTantra — Main Agent Graph
LangGraph StateGraph definition connecting all agents.
"""
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

from app.agents.state import AgentState
from app.agents.supervisor import create_supervisor_node
from app.agents.fraud_agent import create_fraud_agent_node
from app.agents.tax_agent import create_tax_agent_node
from app.agents.strategy_agent import create_strategy_agent_node
from app.agents.execution_agent import create_execution_agent_node
from app.config import settings


class MockChatModel:
    """Fallback mock chat model for testing without real API keys."""
    
    def __init__(self):
        self.model_name = "mock"
    
    async def ainvoke(self, messages, **kwargs):
        """Mock response that routes to strategy agent or provides a generic response."""
        from langchain_core.messages import AIMessage
        # If called from supervisor, return agent name; otherwise return a generic response
        if messages and hasattr(messages[0], 'content') and 'specialist' in messages[0].content.lower():
            return AIMessage(content="STRATEGY_AGENT")
        return AIMessage(content="I've analyzed your financial situation and found several opportunities for optimization. Based on your spending patterns, I recommend reviewing your subscription services and exploring tax-saving strategies. Your net worth velocity is positive at ₹33k/month, which is a strong indicator of financial health.")
    
    def invoke(self, messages, **kwargs):
        """Mock response that routes to strategy agent or provides a generic response."""
        from langchain_core.messages import AIMessage
        if messages and hasattr(messages[0], 'content') and 'specialist' in messages[0].content.lower():
            return AIMessage(content="STRATEGY_AGENT")
        return AIMessage(content="I've analyzed your financial situation and found several opportunities for optimization.")





def get_llm():
    """Get the configured LLM based on settings."""
    # In mock mode without credentials, use mock chat model
    if settings.is_mock and not settings.openai_api_key:
        return MockChatModel()
    
    # Try OpenAI
    if settings.openai_api_key:
        return ChatOpenAI(
            model="gpt-4o",
            api_key=settings.openai_api_key,
            temperature=0.3,
            streaming=True,
        )
    
    # Fallback to mock if no credentials available
    return MockChatModel()


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
