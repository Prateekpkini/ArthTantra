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
    graph = get_graph()

    # Build initial state
    initial_state: AgentState = {
        "messages": [HumanMessage(content=request.message)],
        "current_agent": "",
        "next_agent": "",
        "financial_context": {
            "net_worth": 850000,
            "monthly_income": 85000,
            "monthly_expenses": 52000,
            "savings_rate": 38.8,
            "portfolio_value": 1000000,
            "active_subscriptions": generate_mock_subscriptions(),
            "recent_transactions": generate_mock_transactions(30),
            "anomalies": [],
            "tax_data": {},
            "goals": [
                {"name": "Emergency Fund", "target": 300000, "current": 180000},
                {"name": "Vacation Fund", "target": 150000, "current": 45000},
            ],
        },
        "pending_actions": [],
        "approved_actions": [],
        "reasoning_log": [],
        "verification_needed": False,
        "verification_result": {},
        "final_response": "",
    }

    async def event_stream():
        """Stream SSE events from the agent graph."""
        try:
            # Stream reasoning steps
            reasoning_sent = set()

            async for event in graph.astream(initial_state, stream_mode="updates"):
                for node_name, node_output in event.items():
                    # Stream reasoning log entries
                    reasoning_log = node_output.get("reasoning_log", [])
                    for step in reasoning_log:
                        step_key = f"{step['agent']}_{step['step']}"
                        if step_key not in reasoning_sent:
                            reasoning_sent.add(step_key)
                            yield f"data: {json.dumps({'type': 'reasoning', 'data': step})}\n\n"
                            await asyncio.sleep(0.1)  # Small delay for visual effect

                    # Stream final response
                    if "final_response" in node_output and node_output["final_response"]:
                        yield f"data: {json.dumps({'type': 'response', 'data': {'content': node_output['final_response'], 'agent': node_output.get('current_agent', 'unknown')}})}\n\n"

                    # Stream pending actions (HITL)
                    if "pending_actions" in node_output:
                        for action in node_output["pending_actions"]:
                            yield f"data: {json.dumps({'type': 'hitl_request', 'data': action})}\n\n"

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
