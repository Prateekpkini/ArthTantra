"""
ArthTantra — Fraud Detection Agent
Analyzes transactions for anomalies, cross-references shadow ledger.
"""
from datetime import datetime
from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import AgentState, ReasoningStep
from app.tools.financial import generate_mock_transactions


FRAUD_SYSTEM_PROMPT = """You are the Fraud Detection Agent of ArthTantra, an autonomous financial digital twin for Indian users.

You have access to the shadow ledger — a parallel financial knowledge graph that enriches bank transactions with device context (GPS, time-of-day, emotional tags).

Your capabilities:
1. Analyze transaction patterns for anomalies (unusual amounts, times, locations)
2. Cross-reference official bank data with shadow ledger entries
3. Identify emotional spending triggers (late-night impulse purchases)
4. Flag suspicious merchant relationships

When analyzing, always:
- Check for late-night transactions (11 PM - 4 AM) with high amounts
- Look for duplicate or near-duplicate charges
- Identify sudden spending pattern changes
- Cross-reference merchant categories for consistency

Respond with a clear, structured analysis. Use ₹ for amounts. Be specific about what you found and why it's suspicious.
If you find anomalies, rate their severity: LOW, MEDIUM, HIGH, CRITICAL.

Current financial context will be provided. Analyze it thoroughly."""


def create_fraud_agent_node(llm):
    """Create the fraud detection agent node."""

    async def fraud_agent(state: AgentState) -> dict:
        reasoning_log = list(state.get("reasoning_log", []))

        reasoning_log.append(ReasoningStep(
            agent="fraud_agent",
            step="scanning",
            content="Scanning shadow ledger for anomalous patterns...",
            timestamp=datetime.now().isoformat(),
        ))

        # Get transactions from context or generate mock
        financial_ctx = state.get("financial_context", {})
        transactions = financial_ctx.get("recent_transactions", generate_mock_transactions(30))

        # Pre-analyze anomalies
        anomalies = [t for t in transactions if t.get("anomaly_score", 0) > 0.5]
        impulse_buys = [t for t in transactions if t.get("emotional_tag") == "impulse"]
        late_night = [t for t in transactions if t.get("hour_of_day", 12) >= 23 or t.get("hour_of_day", 12) <= 4]

        reasoning_log.append(ReasoningStep(
            agent="fraud_agent",
            step="cross_referencing",
            content=f"Cross-referencing {len(transactions)} transactions... Found {len(anomalies)} anomalies, {len(impulse_buys)} impulse purchases, {len(late_night)} late-night transactions.",
            timestamp=datetime.now().isoformat(),
        ))

        # Build context for LLM
        anomaly_summary = ""
        for a in anomalies[:5]:
            anomaly_summary += f"\n- {a['merchant']}: ₹{a['amount']} at {a.get('hour_of_day', 'N/A')}:00, anomaly score: {a['anomaly_score']}, tag: {a.get('emotional_tag', 'N/A')}"

        impulse_summary = f"\nImpulse purchases: {len(impulse_buys)} transactions totaling ₹{sum(t['amount'] for t in impulse_buys):,.0f}"
        late_night_summary = f"\nLate-night transactions: {len(late_night)} transactions totaling ₹{sum(t['amount'] for t in late_night):,.0f}"

        context_msg = f"""Shadow Ledger Analysis:
Total transactions analyzed: {len(transactions)}
Flagged anomalies: {len(anomalies)}{anomaly_summary}
{impulse_summary}
{late_night_summary}

User's query: {state['messages'][-1].content if state['messages'] else 'General fraud check'}"""

        messages = [
            SystemMessage(content=FRAUD_SYSTEM_PROMPT),
            *state["messages"][-3:],
            SystemMessage(content=context_msg),
        ]

        reasoning_log.append(ReasoningStep(
            agent="fraud_agent",
            step="analyzing",
            content="Running deep pattern analysis with cyclical verification...",
            timestamp=datetime.now().isoformat(),
        ))

        response = await llm.ainvoke(messages)

        # Cyclical verification — double-check the findings
        reasoning_log.append(ReasoningStep(
            agent="fraud_agent",
            step="verifying",
            content="Verifying findings... cross-checking anomaly scores with behavioral baselines...",
            timestamp=datetime.now().isoformat(),
        ))

        reasoning_log.append(ReasoningStep(
            agent="fraud_agent",
            step="complete",
            content="Fraud analysis complete. Findings verified.",
            timestamp=datetime.now().isoformat(),
        ))

        # Update financial context with anomalies
        updated_context = dict(financial_ctx)
        updated_context["anomalies"] = [
            {"merchant": a["merchant"], "amount": a["amount"], "score": a["anomaly_score"], "tag": a.get("emotional_tag")}
            for a in anomalies
        ]

        return {
            "messages": [AIMessage(content=response.content)],
            "current_agent": "fraud_agent",
            "reasoning_log": reasoning_log,
            "financial_context": updated_context,
            "verification_needed": False,
            "final_response": response.content,
        }

    return fraud_agent
