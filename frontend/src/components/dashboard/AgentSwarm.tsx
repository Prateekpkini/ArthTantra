"use client";

import React, { useEffect, useState } from "react";

interface AgentNode {
  name: string;
  id: string;
  status: "idle" | "thinking" | "active";
  color: string;
  icon: string;
}

interface AgentSwarmProps {
  activeAgent?: string;
}

const defaultAgents: AgentNode[] = [
  { name: "Supervisor", id: "supervisor", status: "idle", color: "#8B5CF6", icon: "🧠" },
  { name: "Fraud Detector", id: "fraud_agent", status: "idle", color: "#EF4444", icon: "🛡️" },
  { name: "Tax Optimizer", id: "tax_agent", status: "idle", color: "#3B82F6", icon: "📊" },
  { name: "Strategist", id: "strategy_agent", status: "idle", color: "#10B981", icon: "📈" },
  { name: "Executor", id: "execution_agent", status: "idle", color: "#F59E0B", icon: "🤖" },
];

export default function AgentSwarm({ activeAgent }: AgentSwarmProps) {
  const [agents, setAgents] = useState<AgentNode[]>(defaultAgents);

  useEffect(() => {
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        status: a.id === activeAgent ? "thinking" : a.id === "supervisor" && activeAgent ? "active" : "idle",
      }))
    );
  }, [activeAgent]);

  return (
    <div className="glass-panel p-5 h-full flex flex-col relative overflow-hidden" style={{ background: "rgba(11,17,33,0.3)" }}>
      {/* Background glow for the panel */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[50px] pointer-events-none" style={{ background: "rgba(139, 92, 246, 0.1)" }}></div>
      
      <div className="flex items-center gap-3 mb-5 z-10">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm glow-border"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <span style={{ color: "var(--accent-cyan)" }}>⚡</span>
        </div>
        <h3
          className="text-md font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Agent Swarm
        </h3>
      </div>

      <div className="space-y-3 z-10 flex-1">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all"
            style={{
              background:
                agent.status !== "idle"
                  ? `${agent.color}15`
                  : "rgba(255,255,255,0.02)",
              border: `1px solid ${
                agent.status !== "idle"
                  ? `${agent.color}40`
                  : "var(--glass-border)"
              }`,
              boxShadow: agent.status !== "idle" ? `0 4px 20px ${agent.color}20` : "none",
              transform: agent.status === "thinking" ? "scale(1.02)" : "scale(1)",
            }}
          >
            {/* Status dot */}
            <div className="relative flex items-center justify-center w-3 h-3">
              <div
                className={`w-2 h-2 rounded-full`}
                style={{ 
                  background: agent.status === "idle" ? "var(--text-muted)" : agent.color,
                  boxShadow: agent.status !== "idle" ? `0 0 10px ${agent.color}` : "none" 
                }}
              />
              {agent.status === "thinking" && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: agent.color,
                    animation: "pulse-ring 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    opacity: 0.5,
                  }}
                />
              )}
            </div>

            {/* Agent info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="text-sm" style={{ filter: agent.status !== "idle" ? `drop-shadow(0 0 5px ${agent.color})` : "none" }}>{agent.icon}</span>
                <span
                  className="text-xs font-bold uppercase tracking-wider truncate"
                  style={{
                    color:
                      agent.status !== "idle"
                        ? agent.color
                        : "var(--text-secondary)",
                  }}
                >
                  {agent.name}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md"
              style={{
                background: agent.status !== "idle" ? `${agent.color}20` : "transparent",
                color:
                  agent.status === "thinking"
                    ? agent.color
                    : agent.status === "active"
                    ? agent.color
                    : "var(--text-muted)",
              }}
            >
              {agent.status === "thinking"
                ? "ACTIVE"
                : agent.status === "active"
                ? "ROUTING"
                : "STANDBY"}
            </span>
          </div>
        ))}
      </div>

      {/* Connections visualization (Glowing SVG) */}
      <div className="mt-6 flex items-center justify-center relative h-16 w-full z-10">
        <svg width="100%" height="100%" viewBox="0 0 300 60" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="stream-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0)" />
              <stop offset="50%" stopColor="rgba(34, 211, 238, 1)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Supervisor in center */}
          <circle cx="150" cy="15" r="7" fill="#8B5CF6" filter="url(#glow)" opacity={activeAgent ? 1 : 0.4} />
          
          {/* Glowing pulse behind supervisor */}
          {activeAgent && (
            <circle cx="150" cy="15" r="7" fill="none" stroke="#8B5CF6" strokeWidth="2" opacity="0.5">
              <animate attributeName="r" values="7;15" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="1s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Lines to sub-agents */}
          {[
            { x: 45, color: "#EF4444", id: "fraud_agent" },
            { x: 100, color: "#3B82F6", id: "tax_agent" },
            { x: 200, color: "#10B981", id: "strategy_agent" },
            { x: 255, color: "#F59E0B", id: "execution_agent" },
          ].map((node) => (
            <g key={node.id}>
              {/* Base Line */}
              <line
                x1="150"
                y1="22"
                x2={node.x}
                y2="45"
                stroke={node.color}
                strokeWidth="2"
                opacity={activeAgent === node.id ? 0.2 : 0.05}
              />
              
              {/* Animated Data Stream */}
              {activeAgent === node.id && (
                <line
                  x1="150"
                  y1="22"
                  x2={node.x}
                  y2="45"
                  stroke="url(#stream-gradient)"
                  strokeWidth="2"
                  strokeDasharray="20 40"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="60;0"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </line>
              )}
              
              {/* Node Target */}
              <circle
                cx={node.x}
                cy="50"
                r="6"
                fill={node.color}
                filter="url(#glow)"
                opacity={activeAgent === node.id ? 1 : 0.3}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
