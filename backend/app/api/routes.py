"""
ArthTantra — API Routes
REST + SSE endpoints for the Next.js frontend.
"""
import json
import asyncio
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from app.agents.graph import get_graph
from app.agents.state import AgentState
from app.tools.financial import (
    generate_mock_transactions,
    generate_mock_portfolio,
    generate_mock_subscriptions,
    calculate_net_worth_velocity,
    detect_subscription_redundancy,
)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"


class ApprovalRequest(BaseModel):
    action_id: str
    approved: bool


# ─── Streaming Chat Endpoint ─────────────────────────────────────────────────

@router.post("/chat")
async def chat_stream(request: ChatRequest):
    """
    Main agent interaction endpoint.
    Streams reasoning steps and final response as SSE events.
    """
    
    async def event_stream():
        """Stream SSE events with mock data for testing."""
        try:
            # Mock reasoning steps
            steps = [
                {"agent": "supervisor", "step": "analyzing", "content": "Analyzing your query: '" + request.message + "'", "timestamp": datetime.now().isoformat()},
                {"agent": "supervisor", "step": "routing", "content": "Routing to Strategy Agent for financial optimization", "timestamp": datetime.now().isoformat()},
                {"agent": "strategy_agent", "step": "loading", "content": "Loading your financial profile...", "timestamp": datetime.now().isoformat()},
                {"agent": "strategy_agent", "step": "velocity", "content": "Computing net worth velocity: ₹33,000/month", "timestamp": datetime.now().isoformat()},
                {"agent": "strategy_agent", "step": "subscriptions", "content": "Analyzing 12 active subscriptions for redundancy...", "timestamp": datetime.now().isoformat()},
                {"agent": "strategy_agent", "step": "portfolio", "content": "Reviewing portfolio allocation across 8 holdings...", "timestamp": datetime.now().isoformat()},
                {"agent": "strategy_agent", "step": "complete", "content": "Analysis complete. All calculations verified ✓", "timestamp": datetime.now().isoformat()},
            ]
            
            for step in steps:
                yield f"data: {json.dumps({'type': 'reasoning', 'data': step})}\n\n"
                await asyncio.sleep(0.2)
            
            # Final response
            response_content = """Based on your financial analysis:

**Net Worth Velocity:** ₹33,000/month (Strong positive trajectory)

**Key Opportunities:**
1. **Subscription Optimization** - Found 3 redundant subscriptions worth ₹1,200/month
2. **Tax Savings** - Potential ₹125,000 savings through deduction optimization
3. **Portfolio Rebalancing** - Could improve returns by 2.3% with sector rotation

**Immediate Actions:**
- Review duplicate streaming services (Netflix + Disney+)
- File updated ITR to claim NPS deductions
- Reallocate 15% from IT stocks to infrastructure sector

Would you like me to take any of these actions?"""
            
            yield f"data: {json.dumps({'type': 'response', 'data': {'content': response_content, 'agent': 'strategy_agent'}})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'data': {'timestamp': datetime.now().isoformat()}})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'data': {'message': str(e)}})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ─── Portfolio Data Endpoint ─────────────────────────────────────────────────

@router.get("/portfolio")
async def get_portfolio():
    """Get portfolio data for 3D visualization."""
    portfolio = generate_mock_portfolio()
    velocity = calculate_net_worth_velocity(850000, 85000, 52000)
    return {
        "portfolio": portfolio,
        "velocity": velocity,
    }


# ─── Transactions Endpoint ───────────────────────────────────────────────────

@router.get("/transactions")
async def get_transactions():
    """Get shadow ledger transactions."""
    transactions = generate_mock_transactions(50)
    return {
        "transactions": transactions,
        "total": len(transactions),
        "anomaly_count": len([t for t in transactions if t["anomaly_score"] > 0.5]),
    }


# ─── Anomalies Endpoint ──────────────────────────────────────────────────────

@router.get("/anomalies")
async def get_anomalies():
    """Get detected anomalies from the shadow ledger."""
    transactions = generate_mock_transactions(50)
    anomalies = [t for t in transactions if t["anomaly_score"] > 0.5]
    return {
        "anomalies": anomalies,
        "count": len(anomalies),
        "total_amount": sum(a["amount"] for a in anomalies),
    }


# ─── Subscriptions Endpoint ──────────────────────────────────────────────────

@router.get("/subscriptions")
async def get_subscriptions():
    """Get active subscriptions and redundancy analysis."""
    subs = generate_mock_subscriptions()
    redundancies = detect_subscription_redundancy(subs)
    return {
        "subscriptions": subs,
        "total_monthly": sum(s["amount"] for s in subs),
        "redundancies": redundancies,
    }


# ─── Agent Status Endpoint ───────────────────────────────────────────────────

@router.get("/agents/status")
async def get_agent_status():
    """Get status of all agents in the swarm."""
    return {
        "agents": [
            {"name": "Supervisor", "id": "supervisor", "status": "idle", "color": "#8B5CF6"},
            {"name": "Fraud Detector", "id": "fraud_agent", "status": "idle", "color": "#EF4444"},
            {"name": "Tax Optimizer", "id": "tax_agent", "status": "idle", "color": "#3B82F6"},
            {"name": "Strategist", "id": "strategy_agent", "status": "idle", "color": "#10B981"},
            {"name": "Executor", "id": "execution_agent", "status": "idle", "color": "#F59E0B"},
        ],
        "timestamp": datetime.now().isoformat(),
    }


# ─── HITL Approval Endpoint ──────────────────────────────────────────────────

@router.post("/actions/approve")
async def approve_action(request: ApprovalRequest):
    """Handle HITL approval/rejection of pending actions."""
    return {
        "action_id": request.action_id,
        "approved": request.approved,
        "status": "approved" if request.approved else "rejected",
        "timestamp": datetime.now().isoformat(),
        "message": f"Action {request.action_id} has been {'approved ✓' if request.approved else 'rejected ✗'}.",
    }
