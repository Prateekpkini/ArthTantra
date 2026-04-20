"""
ArthTantra — Supervisor Agent
Routes user queries to the appropriate specialist agent.
"""
from datetime import datetime
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.agents.state import AgentState, ReasoningStep


SUPERVISOR_SYSTEM_PROMPT = """You are the Supervisor Agent of ArthTantra, an autonomous financial digital twin.

Your role is to:
1. Analyze the user's financial query
2. Route to the most appropriate specialist agent
3. Synthesize responses from sub-agents

Available specialist agents:
- FRAUD_AGENT: Detects anomalies, flags suspicious transactions, cross-references shadow ledger
- TAX_AGENT: Tax optimization, liability estimation, deduction identification (Indian tax regime)
- STRATEGY_AGENT: Net worth velocity, portfolio analysis, opportunity cost, savings optimization
- EXECUTION_AGENT: Cancels subscriptions, negotiates bills, files disputes (requires HITL approval)

Respond with ONLY the agent name to route to. If the query is general, respond with STRATEGY_AGENT.
If the user asks about suspicious activity or fraud, route to FRAUD_AGENT.
If the user asks about taxes, deductions, or ITR, route to TAX_AGENT.
If the user asks to cancel, negotiate, or take action, route to EXECUTION_AGENT.

Respond with just the agent name, nothing else."""


def create_supervisor_node(llm):
    """Create the supervisor routing node."""

    async def supervisor(state: AgentState) -> dict:
        reasoning_log = list(state.get("reasoning_log", []))
        reasoning_log.append(ReasoningStep(
            agent="supervisor",
            step="analyzing",
            content="Analyzing user intent and determining best specialist agent...",
            timestamp=datetime.now().isoformat(),
        ))

        messages = [
            SystemMessage(content=SUPERVISOR_SYSTEM_PROMPT),
            *state["messages"][-5:],  # Last 5 messages for context
        ]

        response = await llm.ainvoke(messages)
        route = response.content.strip().upper()

        # Normalize the route
        valid_agents = ["FRAUD_AGENT", "TAX_AGENT", "STRATEGY_AGENT", "EXECUTION_AGENT"]
        if route not in valid_agents:
            # Default to strategy for general queries
            route = "STRATEGY_AGENT"

        reasoning_log.append(ReasoningStep(
            agent="supervisor",
            step="routed",
            content=f"Routing to {route.replace('_', ' ').title()} for specialized analysis.",
            timestamp=datetime.now().isoformat(),
        ))

        return {
            "current_agent": "supervisor",
            "next_agent": route.lower(),
            "reasoning_log": reasoning_log,
        }

    return supervisor
