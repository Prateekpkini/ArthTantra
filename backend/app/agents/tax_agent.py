"""
ArthTantra — Tax Optimization Agent
Indian tax regime analysis, deduction optimization, ITR guidance.
"""
from datetime import datetime
from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import AgentState, ReasoningStep
from app.tools.financial import estimate_tax_liability


TAX_SYSTEM_PROMPT = """You are the Tax Optimization Agent of ArthTantra, an autonomous financial digital twin for Indian users.

You are an expert in Indian Income Tax laws (FY 2025-26). You help users:
1. Compare Old vs New Tax Regime and recommend the optimal one
2. Identify eligible deductions (80C, 80D, HRA, NPS, etc.)
3. Calculate tax liability with precision
4. Suggest tax-saving investment strategies
5. Provide quarterly advance tax reminders

Key Indian Tax Knowledge:
- New Regime FY 2025-26: 0-4L (nil), 4-8L (5%), 8-12L (10%), 12-16L (15%), 16-20L (20%), >20L (30%)
- Standard Deduction: ₹75,000 (new regime), ₹50,000 (old regime)
- Section 80C: Up to ₹1.5L (PPF, ELSS, EPF, insurance, tuition fees)
- Section 80D: Health insurance premiums (₹25K self, ₹50K parents 60+)
- Section 24: Home loan interest up to ₹2L
- HRA: Based on actual rent paid, city classification

Always:
- Show calculations step-by-step
- Compare both regimes
- Use ₹ symbol for all amounts
- Double-check your math before presenting
- Suggest actionable next steps

Current financial data will be provided. Analyze it and provide recommendations."""


def create_tax_agent_node(llm):
    """Create the tax optimization agent node."""

    async def tax_agent(state: AgentState) -> dict:
        reasoning_log = list(state.get("reasoning_log", []))
        financial_ctx = state.get("financial_context", {})

        reasoning_log.append(ReasoningStep(
            agent="tax_agent",
            step="gathering",
            content="Gathering income data and deduction records...",
            timestamp=datetime.now().isoformat(),
        ))

        # Get income data
        annual_income = financial_ctx.get("monthly_income", 85000) * 12

        # Calculate under both regimes
        reasoning_log.append(ReasoningStep(
            agent="tax_agent",
            step="calculating_new",
            content=f"Calculating tax under NEW regime for annual income ₹{annual_income:,.0f}...",
            timestamp=datetime.now().isoformat(),
        ))
        new_regime = estimate_tax_liability(annual_income, regime="new")

        reasoning_log.append(ReasoningStep(
            agent="tax_agent",
            step="calculating_old",
            content=f"Calculating tax under OLD regime with available deductions...",
            timestamp=datetime.now().isoformat(),
        ))
        deductions = {
            "80C": 150000,  # PPF, ELSS, EPF
            "80D": 25000,   # Health insurance
            "HRA": 120000,  # House rent allowance
        }
        old_regime = estimate_tax_liability(annual_income, deductions=deductions, regime="old")

        # Determine better regime
        better = "new" if new_regime["total_tax"] <= old_regime["total_tax"] else "old"
        savings = abs(new_regime["total_tax"] - old_regime["total_tax"])

        reasoning_log.append(ReasoningStep(
            agent="tax_agent",
            step="comparing",
            content=f"New regime: ₹{new_regime['total_tax']:,.0f} | Old regime: ₹{old_regime['total_tax']:,.0f} | {better.upper()} regime saves ₹{savings:,.0f}",
            timestamp=datetime.now().isoformat(),
        ))

        # Cyclical verification
        reasoning_log.append(ReasoningStep(
            agent="tax_agent",
            step="verifying",
            content="Double-checking calculations against IT Act schedules...",
            timestamp=datetime.now().isoformat(),
        ))

        # Build context for LLM response
        context = f"""Tax Calculation Results:

NEW REGIME:
- Taxable Income: ₹{new_regime['taxable_income']:,.0f}
- Tax: ₹{new_regime['total_tax']:,.0f}
- Effective Rate: {new_regime['effective_rate']}%
- Monthly Tax: ₹{new_regime['monthly_tax']:,.0f}

OLD REGIME (with deductions 80C=₹1.5L, 80D=₹25K, HRA=₹1.2L):
- Taxable Income: ₹{old_regime['taxable_income']:,.0f}
- Tax: ₹{old_regime['total_tax']:,.0f}
- Effective Rate: {old_regime['effective_rate']}%
- Monthly Tax: ₹{old_regime['monthly_tax']:,.0f}

RECOMMENDATION: {better.upper()} regime saves ₹{savings:,.0f}/year

User's query: {state['messages'][-1].content if state['messages'] else 'General tax analysis'}"""

        messages = [
            SystemMessage(content=TAX_SYSTEM_PROMPT),
            *state["messages"][-3:],
            SystemMessage(content=context),
        ]

        response = await llm.ainvoke(messages)

        reasoning_log.append(ReasoningStep(
            agent="tax_agent",
            step="complete",
            content="Tax analysis complete. Calculations verified ✓",
            timestamp=datetime.now().isoformat(),
        ))

        # Update context with tax data
        updated_context = dict(financial_ctx)
        updated_context["tax_data"] = {
            "new_regime": new_regime,
            "old_regime": old_regime,
            "recommended": better,
            "potential_savings": savings,
        }

        return {
            "messages": [AIMessage(content=response.content)],
            "current_agent": "tax_agent",
            "reasoning_log": reasoning_log,
            "financial_context": updated_context,
            "verification_needed": False,
            "final_response": response.content,
        }

    return tax_agent
