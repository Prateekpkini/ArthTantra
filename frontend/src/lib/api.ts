/* ─── API Client for FastAPI Backend ────────────────────────────────────── */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ReasoningStep {
  agent: string;
  step: string;
  content: string;
  timestamp: string;
}

export interface AgentStatus {
  name: string;
  id: string;
  status: "idle" | "thinking" | "active";
  color: string;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  timestamp: string;
  hour_of_day: number;
  emotional_tag: string;
  anomaly_score: number;
  payment_method: string;
  reconciled: boolean;
}

export interface Holding {
  name: string;
  sector: string;
  value: number;
  returns: number;
  allocation: number;
}

export interface Portfolio {
  total_value: number;
  currency: string;
  holdings: Holding[];
  sectors: string[];
  best_performer: string;
  worst_performer: string;
  weighted_return: number;
}

export interface Subscription {
  name: string;
  category: string;
  amount: number;
  billing: string;
  since: string;
}

export interface SSEEvent {
  type: "reasoning" | "response" | "hitl_request" | "done" | "error";
  data: Record<string, unknown>;
}

export interface PendingAction {
  action_id: string;
  action_type: string;
  description: string;
  estimated_amount: number;
  merchant: string;
  agent: string;
  reasoning: string;
  status: string;
}

export interface VelocityData {
  current_net_worth: number;
  monthly_velocity: number;
  savings_rate: number;
  projections: number[];
  optimistic: number[];
  pessimistic: number[];
  annual_projected: number;
  velocity_score: number;
}

/* ─── Fetch Helpers ───────────────────────────────────────────────────── */

export async function fetchPortfolio(): Promise<{
  portfolio: Portfolio;
  velocity: VelocityData;
}> {
  const res = await fetch(`${API_BASE}/portfolio`);
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

export async function fetchTransactions(): Promise<{
  transactions: Transaction[];
  total: number;
  anomaly_count: number;
}> {
  const res = await fetch(`${API_BASE}/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function fetchAnomalies(): Promise<{
  anomalies: Transaction[];
  count: number;
  total_amount: number;
}> {
  const res = await fetch(`${API_BASE}/anomalies`);
  if (!res.ok) throw new Error("Failed to fetch anomalies");
  return res.json();
}

export async function fetchSubscriptions(): Promise<{
  subscriptions: Subscription[];
  total_monthly: number;
  redundancies: Record<string, unknown>[];
}> {
  const res = await fetch(`${API_BASE}/subscriptions`);
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

export async function fetchAgentStatus(): Promise<{
  agents: AgentStatus[];
  timestamp: string;
}> {
  const res = await fetch(`${API_BASE}/agents/status`);
  if (!res.ok) throw new Error("Failed to fetch agent status");
  return res.json();
}

export async function approveAction(
  actionId: string,
  approved: boolean
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/actions/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action_id: actionId, approved }),
  });
  if (!res.ok) throw new Error("Failed to approve action");
  return res.json();
}

/* ─── SSE Stream Consumer ─────────────────────────────────────────────── */

export async function* streamChat(
  message: string
): AsyncGenerator<SSEEvent, void, unknown> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: "default" }),
  });

  if (!res.ok) throw new Error("Chat stream failed");
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const eventStr = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      
      const lines = eventStr.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event: SSEEvent = JSON.parse(line.slice(6));
            yield event;
          } catch {
            // Skip malformed events
          }
        }
      }
      boundary = buffer.indexOf("\n\n");
    }
  }
}
