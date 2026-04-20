"""
ArthTantra — Execution Agent
Autonomous action agent — cancels subscriptions, negotiates bills, files disputes.
Enforces HITL guardrails for actions above the threshold.
"""
from datetime import datetime
import uuid
from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import AgentState, ReasoningStep, PendingAction
from app.config import settings


EXECUTION_SYSTEM_PROMPT = """You are the Execution Agent of ArthTantra, an autonomous financial digital twin.

You can TAKE REAL ACTIONS on behalf of the user:
1. Cancel subscriptions via browser automation
2. Negotiate bills via AI voice calls
3. File charge disputes via phone calls
4. Set up automatic savings rules

CRITICAL RULES:
- ANY action involving money > ₹{threshold} REQUIRES explicit user approval (Human-in-the-Loop)
- You MUST describe the action you want to take and its financial impact
- You MUST wait for approval before executing
- Always explain WHY you're recommending this action
- Show estimated savings/impact

When proposing an action, format it as:
ACTION: [action type]
MERCHANT: [merchant name]  
AMOUNT: ₹[amount involved]
IMPACT: [expected savings/outcome]
REASONING: [why this action makes sense]

Current HITL threshold: ₹{threshold}
""".format(threshold=settings.hitl_threshold)


def create_execution_agent_node(llm):
    """Create the execution agent node."""

    async def execution_agent(state: AgentState) -> dict:
        reasoning_log = list(state.get("reasoning_log", []))
        pending_actions = list(state.get("pending_actions", []))
        financial_ctx = state.get("financial_context", {})

        reasoning_log.append(ReasoningStep(
            agent="execution_agent",
            step="planning",
            content="Planning autonomous action based on user request...",
            timestamp=datetime.now().isoformat(),
        ))

        messages = [
            SystemMessage(content=EXECUTION_SYSTEM_PROMPT),
            *state["messages"][-5:],
        ]

        response = await llm.ainvoke(messages)
        response_text = response.content

        # Parse the response for action proposals
        reasoning_log.append(ReasoningStep(
            agent="execution_agent",
            step="evaluating",
            content="Evaluating proposed action against HITL guardrails...",
            timestamp=datetime.now().isoformat(),
        ))

        # Create a pending action for HITL approval
        # In a real system, we'd parse the LLM response more carefully
        action_id = str(uuid.uuid4())[:8]

        # Check if the action involves significant money
        needs_approval = True  # Default to requiring approval for safety

        if needs_approval:
            pending_action = PendingAction(
                action_id=action_id,
                action_type="autonomous_action",
                description=response_text[:200],
                estimated_amount=0,  # Would be parsed from response
                merchant="",
                agent="execution_agent",
                reasoning=response_text,
                status="pending",
            )
            pending_actions.append(pending_action)

            reasoning_log.append(ReasoningStep(
                agent="execution_agent",
                step="hitl_required",
                content=f"⚠️ Action requires user approval (HITL). Action ID: {action_id}. Waiting for biometric/voice confirmation...",
                timestamp=datetime.now().isoformat(),
            ))

            hitl_notice = f"\n\n---\n🛡️ **HITL GUARDRAIL ACTIVATED**\n\nThis action requires your explicit approval before execution.\n\n**Action ID:** `{action_id}`\n\nPlease review the proposed action above and approve or reject it."
            response_text += hitl_notice
        else:
            reasoning_log.append(ReasoningStep(
                agent="execution_agent",
                step="executing",
                content="Action within auto-execution threshold. Proceeding...",
                timestamp=datetime.now().isoformat(),
            ))

        reasoning_log.append(ReasoningStep(
            agent="execution_agent",
            step="complete",
            content="Execution plan prepared. Awaiting approval." if needs_approval else "Action executed successfully.",
            timestamp=datetime.now().isoformat(),
        ))

        return {
            "messages": [AIMessage(content=response_text)],
            "current_agent": "execution_agent",
            "reasoning_log": reasoning_log,
            "pending_actions": pending_actions,
            "verification_needed": False,
            "final_response": response_text,
        }

    return execution_agent
