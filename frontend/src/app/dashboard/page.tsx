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
      <header className="flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(11,17,33,0.3)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl glow-border" style={{ background: "var(--bg-tertiary)" }}>
            <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✦</span>
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
              <span className="text-gradient">ArthTantra</span>
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-accent)", opacity: 0.8 }}>Autonomous Finance Twin</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl" style={{ background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.2)", boxShadow: "0 0 20px rgba(52,211,153,0.1)" }}>
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-emerald)" }} />
              <div className="absolute w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-emerald)", animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent-emerald)" }}>Core Online</span>
          </div>
          <div className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(159, 122, 234, 0.1)", color: "var(--accent-purple)", border: "1px solid rgba(159, 122, 234, 0.2)" }}>
            Mock Engine
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 pt-6">
        <MetricCard label="Net Worth" value={850000} format="currency" trend={12.3} icon="✦" color="var(--accent-purple)" />
        <MetricCard label="Monthly Savings" value={33000} format="currency" trend={5.2} icon="◈" color="var(--accent-emerald)" />
        <MetricCard label="Savings Rate" value={38.8} format="percent" trend={2.1} icon="◎" color="var(--accent-cyan)" />
        <MetricCard label="Velocity Score" value={77.6} format="score" trend={4.8} icon="⚡" color="var(--accent-amber)" />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid" style={{ padding: "24px", gap: "24px" }}>
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
