"""
ArthTantra — LangGraph Shared Agent State
Defines the TypedDict schema that flows through the entire agent graph.
"""
from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages


class PendingAction(TypedDict):
    """An action awaiting HITL approval."""
    action_id: str
    action_type: str            # 'cancel_subscription', 'negotiate_bill', 'transfer', 'dispute'
    description: str
    estimated_amount: float     # INR amount involved
    merchant: str
    agent: str                  # Which agent proposed it
    reasoning: str
    status: str                 # 'pending', 'approved', 'rejected', 'executed'


class ReasoningStep(TypedDict):
    """A single step in the agent's internal monologue."""
    agent: str
    step: str
    content: str
    timestamp: str


class FinancialContext(TypedDict, total=False):
    """Financial data context available to all agents."""
    net_worth: float
    monthly_income: float
    monthly_expenses: float
    savings_rate: float
    portfolio_value: float
    active_subscriptions: list[dict]
    recent_transactions: list[dict]
    anomalies: list[dict]
    tax_data: dict
    goals: list[dict]


class AgentState(TypedDict):
    """
    The shared state that flows through all nodes in the LangGraph.
    Uses Annotated[list, add_messages] for automatic message merging.
    """
    # Conversation messages (auto-merged by LangGraph)
    messages: Annotated[list, add_messages]

    # Current routing
    current_agent: str
    next_agent: str

    # Financial data
    financial_context: FinancialContext

    # HITL guardrails
    pending_actions: list[PendingAction]
    approved_actions: list[str]  # List of approved action_ids

    # Streaming reasoning (displayed to user in real-time)
    reasoning_log: list[ReasoningStep]

    # Verification state
    verification_needed: bool
    verification_result: dict

    # Final output
    final_response: str
