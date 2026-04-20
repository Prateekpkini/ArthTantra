"use client";

import React, { useState } from "react";

interface ActionItem {
  id: string;
  type: string;
  description: string;
  agent: string;
  status: "pending" | "approved" | "rejected" | "executing" | "completed";
  amount?: number;
  timestamp: string;
}

const mockActions: ActionItem[] = [
  { id: "act_001", type: "cancel_subscription", description: "Cancel Disney+ Hotstar — redundant with Netflix", agent: "execution_agent", status: "pending", amount: 299, timestamp: "2026-04-20T17:00:00" },
  { id: "act_002", type: "negotiate_bill", description: "Negotiate Jio plan — loyalty discount available", agent: "execution_agent", status: "approved", amount: 999, timestamp: "2026-04-20T16:30:00" },
  { id: "act_003", type: "dispute_charge", description: "Dispute unknown ₹4,999 charge on Credit Card", agent: "fraud_agent", status: "executing", amount: 4999, timestamp: "2026-04-20T15:00:00" },
  { id: "act_004", type: "cancel_subscription", description: "Cancel Google One — redundant with iCloud", agent: "execution_agent", status: "completed", amount: 130, timestamp: "2026-04-19T12:00:00" },
];

export default function ActionLog() {
  const [actions, setActions] = useState<ActionItem[]>(mockActions);

  const handleApprove = (id: string) => {
    setActions((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" as const } : a));
  };

  const handleReject = (id: string) => {
    setActions((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" as const } : a));
  };

  const statusIcons: Record<string, string> = {
    pending: "⏳", approved: "✅", rejected: "❌", executing: "⚡", completed: "✓",
  };

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: "rgba(245,158,11,0.15)" }}>🤖</div>
        <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Action Log</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2" style={{ minHeight: 0 }}>
        {actions.map((action) => (
          <div key={action.id} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-start justify-between mb-1">
              <p className="text-xs font-medium flex-1" style={{ color: "var(--text-primary)" }}>{action.description}</p>
              <span className={`action-badge ${action.status}`}>{statusIcons[action.status]} {action.status}</span>
            </div>
            {action.amount && (
              <p className="text-[10px] mb-2" style={{ color: "var(--text-muted)" }}>
                Amount: <span style={{ fontFamily: "var(--font-mono)" }}>₹{action.amount.toLocaleString()}</span>
              </p>
            )}
            {action.status === "pending" && (
              <div className="hitl-panel mt-2">
                <p className="text-[10px] mb-2" style={{ color: "var(--accent-amber)" }}>🛡️ HITL Approval Required</p>
                <div className="flex gap-2">
                  <button className="approve-btn text-xs" onClick={() => handleApprove(action.id)}>✓ Approve</button>
                  <button className="reject-btn text-xs" onClick={() => handleReject(action.id)}>✗ Reject</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
