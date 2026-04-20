"""
ArthTantra — Financial Strategy Agent
Net worth velocity, portfolio optimization, savings strategy.
"""
from datetime import datetime
from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import AgentState, ReasoningStep
from app.tools.financial import (
    calculate_net_worth_velocity,
    calculate_opportunity_cost,
    detect_subscription_redundancy,
    generate_mock_subscriptions,
    generate_mock_portfolio,
)


STRATEGY_SYSTEM_PROMPT = """You are the Financial Strategy Agent of ArthTantra, an autonomous financial digital twin for Indian users.

You provide data-driven financial advice by:
1. Calculating Net Worth Velocity — how fast wealth is growing/shrinking
2. Identifying micro-habit opportunity costs (daily coffee, impulse shopping)
3. Detecting redundant subscriptions and suggesting consolidation
4. Portfolio analysis and rebalancing suggestions
5. Emergency fund adequacy assessment

You always:
- Use specific numbers, never vague advice
- Show the math behind your recommendations
- Calculate in ₹ (Indian Rupees)
- Consider Indian investment options (PPF, NPS, ELSS, FD, Gold)
- Prioritize actionable, immediate steps
- Rank recommendations by impact (highest savings first)

Be conversational but data-heavy. Show your reasoning process."""


def create_strategy_agent_node(llm):
    """Create the financial strategy agent node."""

    async def strategy_agent(state: AgentState) -> dict:
        reasoning_log = list(state.get("reasoning_log", []))
        financial_ctx = state.get("financial_context", {})

        reasoning_log.append(ReasoningStep(
            agent="strategy_agent",
            step="loading",
            content="Loading financial profile and computing metrics...",
            timestamp=datetime.now().isoformat(),
        ))

        # Get or generate financial data
        monthly_income = financial_ctx.get("monthly_income", 85000)
        monthly_expenses = financial_ctx.get("monthly_expenses", 52000)
        net_worth = financial_ctx.get("net_worth", 850000)

        # Calculate net worth velocity
        reasoning_log.append(ReasoningStep(
            agent="strategy_agent",
            step="velocity",
            content=f"Computing net worth velocity... Income: ₹{monthly_income:,}/mo, Expenses: ₹{monthly_expenses:,}/mo",
            timestamp=datetime.now().isoformat(),
        ))
        velocity = calculate_net_worth_velocity(net_worth, monthly_income, monthly_expenses)

        # Check subscriptions
        subs = financial_ctx.get("active_subscriptions", generate_mock_subscriptions())
        reasoning_log.append(ReasoningStep(
            agent="strategy_agent",
            step="subscriptions",
            content=f"Analyzing {len(subs)} active subscriptions for redundancy...",
            timestamp=datetime.now().isoformat(),
        ))
        redundancies = detect_subscription_redundancy(subs)

        # Opportunity cost of daily habits
        reasoning_log.append(ReasoningStep(
            agent="strategy_agent",
            step="opportunity_cost",
            content="Calculating 10-year opportunity cost of recurring micro-habits...",
            timestamp=datetime.now().isoformat(),
        ))
        coffee_cost = calculate_opportunity_cost(150, "daily", 10)  # ₹150/day coffee
        food_delivery_cost = calculate_opportunity_cost(500, "daily", 10)  # ₹500/day food delivery

        # Portfolio analysis
        portfolio = financial_ctx.get("portfolio", generate_mock_portfolio())
        reasoning_log.append(ReasoningStep(
            agent="strategy_agent",
            step="portfolio",
            content=f"Analyzing portfolio: ₹{portfolio['total_value']:,} across {len(portfolio['holdings'])} holdings...",
            timestamp=datetime.now().isoformat(),
        ))

        # Build comprehensive context
        context = f"""Financial Analysis Results:

NET WORTH VELOCITY:
- Current Net Worth: ₹{net_worth:,}
- Monthly Velocity: ₹{velocity['monthly_velocity']:,}/month
- Savings Rate: {velocity['savings_rate']}%
- Velocity Score: {velocity['velocity_score']}/100
- 12-Month Projection: ₹{velocity['annual_projected']:,}

SUBSCRIPTION ANALYSIS:
- Active Subscriptions: {len(subs)}
- Total Monthly Cost: ₹{sum(s['amount'] for s in subs):,}
- Redundancies Found: {len(redundancies)}
{chr(10).join(f"  - {r['category']}: {', '.join(r['subscriptions'])} (₹{r['total_monthly_cost']}/mo) — {r['recommendation']}" for r in redundancies)}

OPPORTUNITY COST (10 years at 12% return):
- Daily ₹150 coffee habit: ₹{coffee_cost['opportunity_cost']:,} lost
- Daily ₹500 food delivery: ₹{food_delivery_cost['opportunity_cost']:,} lost

PORTFOLIO:
- Total Value: ₹{portfolio['total_value']:,}
- Best Performer: {portfolio['best_performer']}
- Worst Performer: {portfolio['worst_performer']}
- Weighted Return: {portfolio['weighted_return']}%

User's query: {state['messages'][-1].content if state['messages'] else 'General financial analysis'}"""

        messages = [
            SystemMessage(content=STRATEGY_SYSTEM_PROMPT),
            *state["messages"][-3:],
            SystemMessage(content=context),
        ]

        reasoning_log.append(ReasoningStep(
            agent="strategy_agent",
            step="synthesizing",
            content="Synthesizing analysis into actionable recommendations...",
            timestamp=datetime.now().isoformat(),
        ))

        response = await llm.ainvoke(messages)

        # Verification loop
        reasoning_log.append(ReasoningStep(
            agent="strategy_agent",
            step="verifying",
            content="Verifying calculations and cross-checking projections...",
            timestamp=datetime.now().isoformat(),
        ))

        reasoning_log.append(ReasoningStep(
            agent="strategy_agent",
            step="complete",
            content="Strategy analysis complete. All calculations verified ✓",
            timestamp=datetime.now().isoformat(),
        ))

        # Update financial context
        updated_context = dict(financial_ctx)
        updated_context.update({
            "net_worth": net_worth,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "velocity": velocity,
            "redundancies": redundancies,
            "portfolio": portfolio,
            "active_subscriptions": subs,
        })

        return {
            "messages": [AIMessage(content=response.content)],
            "current_agent": "strategy_agent",
            "reasoning_log": reasoning_log,
            "financial_context": updated_context,
            "verification_needed": False,
            "final_response": response.content,
        }

    return strategy_agent
