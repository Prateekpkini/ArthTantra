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
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
            style={{ background: "rgba(244, 63, 94, 0.15)" }}
          >
            📋
          </div>
          <h3
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shadow Ledger
          </h3>
        </div>
        <div className="flex gap-1">
          {(["all", "flagged", "reconciled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[10px] px-2 py-1 rounded-md transition-all capitalize"
              style={{
                background: filter === f ? "rgba(139, 92, 246, 0.15)" : "transparent",
                color: filter === f ? "var(--accent-purple)" : "var(--text-muted)",
                border: `1px solid ${filter === f ? "rgba(139, 92, 246, 0.3)" : "transparent"}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ minHeight: 0 }}>
        {filtered.map((txn, i) => (
          <div
            key={txn.id}
            className="rounded-xl p-3 transition-all animate-fade-in-up"
            style={{
              background: txn.anomaly_score > 0.5
                ? "rgba(244, 63, 94, 0.05)"
                : "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${
                txn.anomaly_score > 0.5
                  ? "rgba(244, 63, 94, 0.2)"
                  : "var(--glass-border)"
              }`,
              animationDelay: `${i * 50}ms`,
            }}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {txn.merchant}
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {txn.payment_method} · {formatTime(txn.timestamp)}
                  {txn.hour_of_day >= 23 || txn.hour_of_day <= 4 ? " 🌙" : ""}
                </p>
              </div>
              <p className="text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                ₹{txn.amount.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Emotional tag */}
              <span
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: `${tagColors[txn.emotional_tag] || "#64748B"}15`,
                  color: tagColors[txn.emotional_tag] || "#64748B",
                }}
              >
                {txn.emotional_tag}
              </span>

              {/* Anomaly bar */}
              <div className="flex-1">
                <div className="anomaly-bar">
                  <div
                    className={`anomaly-bar-fill ${getAnomalyLevel(txn.anomaly_score)}`}
                    style={{ width: `${txn.anomaly_score * 100}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              {txn.reconciled ? (
                <span className="text-[9px]" style={{ color: "var(--accent-emerald)" }}>✓</span>
              ) : (
                <span className="text-[9px]" style={{ color: "var(--accent-rose)" }}>⚠</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        className="mt-3 pt-3 flex justify-between text-[10px]"
        style={{ borderTop: "1px solid var(--glass-border)", color: "var(--text-muted)" }}
      >
        <span>{filtered.length} transactions</span>
        <span>{filtered.filter((t) => t.anomaly_score > 0.5).length} flagged</span>
        <span>₹{filtered.reduce((s, t) => s + t.amount, 0).toLocaleString()} total</span>
      </div>
    </div>
  );
}
