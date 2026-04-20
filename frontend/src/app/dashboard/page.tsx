"use client";

import React, { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import ChatInterface from "@/components/chat/ChatInterface";
import AgentSwarm from "@/components/dashboard/AgentSwarm";
import ShadowLedger from "@/components/dashboard/ShadowLedger";
import NetWorthVelocity from "@/components/dashboard/NetWorthVelocity";
import ActionLog from "@/components/dashboard/ActionLog";
import MetricCard from "@/components/ui/MetricCard";
import type { ReasoningStep } from "@/lib/api";

// Dynamic import for Three.js (no SSR)
const PortfolioMap = dynamic(
  () => import("@/components/three/PortfolioMap"),
  { ssr: false, loading: () => (
    <div className="glass-panel flex items-center justify-center h-full" style={{ minHeight: "300px" }}>
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent-purple)", borderTopColor: "transparent", animation: "spin-slow 1s linear infinite" }} />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading 3D Portfolio...</p>
      </div>
    </div>
  )}
);

export default function DashboardPage() {
  const [activeAgent, setActiveAgent] = useState<string>("");
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);

  const handleReasoningUpdate = useCallback((steps: ReasoningStep[]) => {
    setReasoningSteps(steps);
  }, []);

  const handleAgentActivity = useCallback((agentId: string, status: string) => {
    if (agentId === "all") {
      setActiveAgent("");
    } else {
      setActiveAgent(agentId);
    }
  }, []);

  return (
    <div className="min-h-screen relative z-10">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "var(--gradient-primary)" }}>🏦</div>
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
              <span className="text-gradient">ArthTantra</span>
            </h1>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Autonomous Financial Digital Twin</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-emerald)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--accent-emerald)" }}>System Online</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(139,92,246,0.1)", color: "var(--accent-purple)", border: "1px solid rgba(139,92,246,0.2)" }}>
            Mock Mode
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pt-4">
        <MetricCard label="Net Worth" value={850000} format="currency" trend={12.3} icon="💰" color="#8B5CF6" />
        <MetricCard label="Monthly Savings" value={33000} format="currency" trend={5.2} icon="📈" color="#10B981" />
        <MetricCard label="Savings Rate" value={38.8} format="percent" trend={2.1} icon="🎯" color="#06B6D4" />
        <MetricCard label="Velocity Score" value={77.6} format="score" trend={4.8} icon="⚡" color="#F59E0B" />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column — Chat */}
        <div className="flex flex-col gap-4" style={{ gridRow: "1 / -1" }}>
          <div className="flex-1" style={{ minHeight: 0 }}>
            <ChatInterface
              onReasoningUpdate={handleReasoningUpdate}
              onAgentActivity={handleAgentActivity}
            />
          </div>
        </div>

        {/* Center Column — Visualizations */}
        <div className="flex flex-col gap-4">
          {/* 3D Portfolio Map */}
          <div style={{ height: "380px" }}>
            <PortfolioMap />
          </div>
          {/* Net Worth Velocity */}
          <NetWorthVelocity />
        </div>

        {/* Right Column — Status & Actions */}
        <div className="flex flex-col gap-4" style={{ gridRow: "1 / -1" }}>
          <AgentSwarm activeAgent={activeAgent} />
          <div className="flex-1" style={{ minHeight: 0 }}>
            <ActionLog />
          </div>
          <div style={{ maxHeight: "350px" }}>
            <ShadowLedger />
          </div>
        </div>
      </div>
    </div>
  );
}
