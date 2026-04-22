"use client";

import React, { useState, useEffect } from "react";

interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  timestamp: string;
  hour_of_day: number;
  emotional_tag: string;
  anomaly_score: number;
  payment_method: string;
  reconciled: boolean;
}

interface ShadowLedgerProps {
  transactions?: Transaction[];
}

const mockTransactions: Transaction[] = [
  { id: "txn_001", merchant: "Amazon India", category: "shopping", amount: 12499, timestamp: "2026-04-20T02:30:00", hour_of_day: 2, emotional_tag: "impulse", anomaly_score: 0.85, payment_method: "Credit Card", reconciled: false },
  { id: "txn_002", merchant: "Swiggy", category: "food_delivery", amount: 756, timestamp: "2026-04-19T23:15:00", hour_of_day: 23, emotional_tag: "impulse", anomaly_score: 0.3, payment_method: "UPI", reconciled: true },
  { id: "txn_003", merchant: "Unknown Merchant", category: "other", amount: 4999, timestamp: "2026-04-19T03:45:00", hour_of_day: 3, emotional_tag: "impulse", anomaly_score: 0.92, payment_method: "Credit Card", reconciled: false },
  { id: "txn_004", merchant: "BigBasket", category: "groceries", amount: 2340, timestamp: "2026-04-18T10:30:00", hour_of_day: 10, emotional_tag: "planned", anomaly_score: 0.05, payment_method: "UPI", reconciled: true },
  { id: "txn_005", merchant: "Netflix", category: "entertainment", amount: 649, timestamp: "2026-04-17T00:00:00", hour_of_day: 0, emotional_tag: "routine", anomaly_score: 0.0, payment_method: "Credit Card", reconciled: true },
  { id: "txn_006", merchant: "Flipkart", category: "shopping", amount: 8999, timestamp: "2026-04-16T01:20:00", hour_of_day: 1, emotional_tag: "impulse", anomaly_score: 0.72, payment_method: "Credit Card", reconciled: false },
  { id: "txn_007", merchant: "Electricity Bill", category: "utilities", amount: 3200, timestamp: "2026-04-15T11:00:00", hour_of_day: 11, emotional_tag: "routine", anomaly_score: 0.0, payment_method: "Net Banking", reconciled: true },
  { id: "txn_008", merchant: "Starbucks", category: "cafe", amount: 680, timestamp: "2026-04-14T16:30:00", hour_of_day: 16, emotional_tag: "planned", anomaly_score: 0.1, payment_method: "UPI", reconciled: true },
];

export default function ShadowLedger({ transactions }: ShadowLedgerProps) {
  const [data, setData] = useState<Transaction[]>(transactions || mockTransactions);
  const [filter, setFilter] = useState<"all" | "flagged" | "reconciled">("all");

  const filtered = data.filter((t) => {
    if (filter === "flagged") return t.anomaly_score > 0.5;
    if (filter === "reconciled") return t.reconciled;
    return true;
  });

  const tagColors: Record<string, string> = {
    impulse: "#F43F5E",
    planned: "#3B82F6",
    routine: "#64748B",
    splurge: "#F59E0B",
  };

  const getAnomalyLevel = (score: number) => {
    if (score >= 0.7) return "high";
    if (score >= 0.4) return "medium";
    return "low";
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 1) return "Today";
    if (diff < 2) return "Yesterday";
    return `${Math.floor(diff)}d ago`;
  };

  return (
    <div className="glass-panel p-5 h-full flex flex-col relative overflow-hidden" style={{ background: "rgba(11,17,33,0.3)" }}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: "rgba(244, 63, 94, 0.05)" }}></div>
      <div className="flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm glow-border"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <span style={{ color: "var(--accent-rose)" }}>📋</span>
          </div>
          <h3
            className="text-md font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Shadow Ledger
          </h3>
        </div>
        <div className="flex gap-1.5 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
          {(["all", "flagged", "reconciled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-md transition-all capitalize tracking-wide"
              style={{
                background: filter === f ? "rgba(159, 122, 234, 0.2)" : "transparent",
                color: filter === f ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: filter === f ? "0 0 10px rgba(159, 122, 234, 0.2)" : "none",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 z-10" style={{ minHeight: 0 }}>
        {filtered.map((txn, i) => (
          <div
            key={txn.id}
            className="rounded-2xl p-4 transition-all animate-fade-in-up hover:scale-[1.02] hover:z-10 relative cursor-pointer"
            style={{
              background: txn.anomaly_score > 0.5
                ? "rgba(244, 63, 94, 0.08)"
                : "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${
                txn.anomaly_score > 0.5
                  ? "rgba(244, 63, 94, 0.3)"
                  : "var(--glass-border)"
              }`,
              boxShadow: txn.anomaly_score > 0.5 ? "0 4px 20px rgba(244, 63, 94, 0.15)" : "none",
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)", letterSpacing: "0.02em" }}>
                  {txn.merchant}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-widest mt-1" style={{ color: "var(--text-muted)" }}>
                  {txn.payment_method} · {formatTime(txn.timestamp)}
                  {txn.hour_of_day >= 23 || txn.hour_of_day <= 4 ? " 🌙" : ""}
                </p>
              </div>
              <p className="text-base font-black" style={{ fontFamily: "var(--font-mono)", color: txn.anomaly_score > 0.5 ? "var(--accent-rose)" : "var(--text-primary)" }}>
                ₹{txn.amount.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Emotional tag */}
              <span
                className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded"
                style={{
                  background: `${tagColors[txn.emotional_tag] || "#64748B"}20`,
                  color: tagColors[txn.emotional_tag] || "#64748B",
                  boxShadow: `0 0 10px ${tagColors[txn.emotional_tag] || "#64748B"}20`
                }}
              >
                {txn.emotional_tag}
              </span>

              {/* Anomaly bar (Laser) */}
              <div className="flex-1 relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${getAnomalyLevel(txn.anomaly_score)}`}
                  style={{ 
                    width: `${txn.anomaly_score * 100}%`,
                    background: txn.anomaly_score > 0.5 ? "var(--accent-rose)" : txn.anomaly_score > 0.2 ? "var(--accent-amber)" : "var(--accent-emerald)",
                    boxShadow: `0 0 10px ${txn.anomaly_score > 0.5 ? "var(--accent-rose)" : txn.anomaly_score > 0.2 ? "var(--accent-amber)" : "var(--accent-emerald)"}`
                  }}
                />
              </div>

              {/* Status */}
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: txn.reconciled ? "rgba(52, 211, 153, 0.15)" : "rgba(244, 63, 94, 0.15)" }}>
                {txn.reconciled ? (
                  <span className="text-[10px]" style={{ color: "var(--accent-emerald)" }}>✓</span>
                ) : (
                  <span className="text-[10px]" style={{ color: "var(--accent-rose)" }}>⚠</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        className="mt-4 pt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest z-10"
        style={{ borderTop: "1px solid var(--glass-border)", color: "var(--text-muted)" }}
      >
        <span>{filtered.length} transactions</span>
        <span style={{ color: filtered.filter((t) => t.anomaly_score > 0.5).length > 0 ? "var(--accent-rose)" : "inherit" }}>{filtered.filter((t) => t.anomaly_score > 0.5).length} flagged</span>
        <span style={{ color: "var(--text-primary)" }}>₹{filtered.reduce((s, t) => s + t.amount, 0).toLocaleString()}</span>
      </div>
    </div>
  );
}
