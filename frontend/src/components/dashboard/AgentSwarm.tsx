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
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
          style={{ background: "rgba(139, 92, 246, 0.15)" }}
        >
          ⚡
        </div>
        <h3
          className="text-sm font-semibold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Agent Swarm
        </h3>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{
              background:
                agent.status !== "idle"
                  ? `${agent.color}10`
                  : "transparent",
              border: `1px solid ${
                agent.status !== "idle"
                  ? `${agent.color}30`
                  : "transparent"
              }`,
            }}
          >
            {/* Status dot */}
            <div className="relative">
              <div
                className={`agent-dot ${agent.status}`}
                style={{ background: agent.color }}
              />
              {agent.status === "thinking" && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: agent.color,
                    animation: "pulse-ring 1.5s ease-out infinite",
                    opacity: 0.3,
                    transform: "scale(2)",
                  }}
                />
              )}
            </div>

            {/* Agent info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm">{agent.icon}</span>
                <span
                  className="text-xs font-medium truncate"
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
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{
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
                : "IDLE"}
            </span>
          </div>
        ))}
      </div>

      {/* Connections visualization */}
      <div className="mt-4 flex items-center justify-center">
        <svg width="200" height="60" viewBox="0 0 200 60">
          {/* Supervisor in center */}
          <circle cx="100" cy="15" r="6" fill="#8B5CF6" opacity={activeAgent ? 0.8 : 0.3} />
          {/* Lines to sub-agents */}
          {[
            { x: 30, color: "#EF4444", id: "fraud_agent" },
            { x: 65, color: "#3B82F6", id: "tax_agent" },
            { x: 135, color: "#10B981", id: "strategy_agent" },
            { x: 170, color: "#F59E0B", id: "execution_agent" },
          ].map((node) => (
            <g key={node.id}>
              <line
                x1="100"
                y1="21"
                x2={node.x}
                y2="45"
                stroke={node.color}
                strokeWidth="1.5"
                opacity={activeAgent === node.id ? 0.8 : 0.15}
                strokeDasharray={activeAgent === node.id ? "none" : "4 4"}
              >
                {activeAgent === node.id && (
                  <animate
                    attributeName="stroke-dashoffset"
                    values="8;0"
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
              <circle
                cx={node.x}
                cy="50"
                r="5"
                fill={node.color}
                opacity={activeAgent === node.id ? 0.8 : 0.25}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
