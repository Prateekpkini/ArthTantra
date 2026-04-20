"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { streamChat, type ReasoningStep, type SSEEvent } from "@/lib/api";
import { useVoice } from "@/hooks/useVoice";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agent?: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  onReasoningUpdate?: (steps: ReasoningStep[]) => void;
  onAgentActivity?: (agentId: string, status: string) => void;
}

export default function ChatInterface({
  onReasoningUpdate,
  onAgentActivity,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "🏦 **Welcome to ArthTantra.** I'm your autonomous financial digital twin.\n\nI can analyze your finances, detect fraud, optimize taxes, and even cancel subscriptions on your behalf. Try asking me:\n\n- *\"Analyze my spending patterns\"*\n- *\"Check for suspicious transactions\"*\n- *\"How can I save on taxes?\"*\n- *\"Cancel my redundant subscriptions\"*",
      agent: "supervisor",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [showReasoning, setShowReasoning] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voice = useVoice();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, reasoningSteps]);

  // Voice transcript → input
  useEffect(() => {
    if (voice.transcript && !voice.isListening) {
      setInput(voice.transcript);
    }
  }, [voice.transcript, voice.isListening]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const msg = input.trim();
      if (!msg || isStreaming) return;

      // Add user message
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: msg,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsStreaming(true);
      setReasoningSteps([]);

      try {
        let responseContent = "";
        let responseAgent = "";

        for await (const event of streamChat(msg)) {
          switch (event.type) {
            case "reasoning": {
              const step = event.data as unknown as ReasoningStep;
              setReasoningSteps((prev) => {
                const updated = [...prev, step];
                onReasoningUpdate?.(updated);
                return updated;
              });
              onAgentActivity?.(step.agent, "thinking");
              break;
            }
            case "response": {
              const data = event.data as { content: string; agent: string };
              responseContent = data.content;
              responseAgent = data.agent;
              break;
            }
            case "done": {
              if (responseContent) {
                const assistantMsg: Message = {
                  id: `ai-${Date.now()}`,
                  role: "assistant",
                  content: responseContent,
                  agent: responseAgent,
                  timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
              }
              onAgentActivity?.("all", "idle");
              break;
            }
            case "error": {
              const errData = event.data as { message: string };
              setMessages((prev) => [
                ...prev,
                {
                  id: `err-${Date.now()}`,
                  role: "assistant",
                  content: `⚠️ Error: ${errData.message}`,
                  timestamp: new Date().toISOString(),
                },
              ]);
              break;
            }
          }
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `⚠️ Connection error. Make sure the backend is running on port 8000.\n\n\`uvicorn app.main:app --reload --port 8000\``,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [input, isStreaming, onReasoningUpdate, onAgentActivity]
  );

  const agentColors: Record<string, string> = {
    supervisor: "#8B5CF6",
    fraud_agent: "#EF4444",
    tax_agent: "#3B82F6",
    strategy_agent: "#10B981",
    execution_agent: "#F59E0B",
  };

  const agentNames: Record<string, string> = {
    supervisor: "Supervisor",
    fraud_agent: "Fraud Detector",
    tax_agent: "Tax Optimizer",
    strategy_agent: "Strategist",
    execution_agent: "Executor",
  };

  return (
    <div className="glass-panel flex flex-col h-full" style={{ padding: 0 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--glass-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            🧠
          </div>
          <div>
            <h3
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ArthTantra AI
            </h3>
            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {isStreaming ? "Thinking..." : "Ready"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: showReasoning
              ? "rgba(139, 92, 246, 0.15)"
              : "transparent",
            color: showReasoning
              ? "var(--accent-purple)"
              : "var(--text-muted)",
            border: `1px solid ${
              showReasoning
                ? "rgba(139, 92, 246, 0.3)"
                : "var(--glass-border)"
            }`,
          }}
        >
          {showReasoning ? "🔍 Reasoning ON" : "🔍 Reasoning OFF"}
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="chat-message">
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div
                  className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md text-sm"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "white",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs mt-1"
                  style={{
                    background: msg.agent
                      ? `${agentColors[msg.agent]}20`
                      : "rgba(139,92,246,0.1)",
                    color: msg.agent
                      ? agentColors[msg.agent]
                      : "var(--accent-purple)",
                    border: `1px solid ${
                      msg.agent
                        ? `${agentColors[msg.agent]}30`
                        : "rgba(139,92,246,0.2)"
                    }`,
                  }}
                >
                  {msg.agent === "fraud_agent"
                    ? "🛡️"
                    : msg.agent === "tax_agent"
                    ? "📊"
                    : msg.agent === "strategy_agent"
                    ? "📈"
                    : msg.agent === "execution_agent"
                    ? "🤖"
                    : "🧠"}
                </div>
                <div className="max-w-[90%]">
                  {msg.agent && (
                    <p
                      className="text-xs font-medium mb-1"
                      style={{
                        color: agentColors[msg.agent] || "var(--text-muted)",
                      }}
                    >
                      {agentNames[msg.agent] || msg.agent}
                    </p>
                  )}
                  <div
                    className="markdown-content text-sm"
                    style={{ lineHeight: 1.7 }}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Streaming reasoning */}
        {isStreaming && showReasoning && reasoningSteps.length > 0 && (
          <div
            className="rounded-xl p-4 space-y-2"
            style={{
              background: "rgba(139, 92, 246, 0.05)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
            }}
          >
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: "var(--accent-purple)" }}
            >
              🔍 Agent Reasoning
            </p>
            {reasoningSteps.map((step, i) => (
              <div
                key={`${step.agent}-${step.step}-${i}`}
                className={`reasoning-step ${
                  i === reasoningSteps.length - 1 ? "active" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background:
                        agentColors[step.agent] || "var(--accent-purple)",
                    }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color:
                        agentColors[step.agent] || "var(--accent-purple)",
                    }}
                  >
                    {agentNames[step.agent] || step.agent}
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.content}
                  {i === reasoningSteps.length - 1 && (
                    <span className="cursor" />
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Streaming indicator */}
        {isStreaming && reasoningSteps.length === 0 && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  background: "var(--accent-purple)",
                  animationDelay: "0ms",
                }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  background: "var(--accent-blue)",
                  animationDelay: "150ms",
                }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  background: "var(--accent-cyan)",
                  animationDelay: "300ms",
                }}
              />
            </div>
            <span
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Connecting to agent swarm...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 pb-4 pt-2"
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isStreaming
                ? "Agent is thinking..."
                : "Ask about your finances..."
            }
            disabled={isStreaming}
            className="chat-input flex-1 px-4 py-3 text-sm"
            id="chat-input"
          />
          {voice.isSupported && (
            <button
              type="button"
              onClick={voice.toggleListening}
              className={`voice-btn ${voice.isListening ? "listening" : ""}`}
              title="Voice input"
              id="voice-button"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
            style={{
              background:
                !isStreaming && input.trim()
                  ? "var(--gradient-primary)"
                  : "var(--bg-tertiary)",
              color:
                !isStreaming && input.trim()
                  ? "white"
                  : "var(--text-muted)",
              cursor:
                !isStreaming && input.trim() ? "pointer" : "not-allowed",
            }}
            id="send-button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" x2="11" y1="2" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
