"use client";

import React, { useEffect, useState } from "react";

interface MetricCardProps {
  label: string;
  value: number;
  format?: "currency" | "percent" | "number" | "score";
  trend?: number;
  icon: string;
  color: string;
}

export default function MetricCard({
  label,
  value,
  format = "currency",
  trend,
  icon,
  color,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated countup
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, value);
      // Ease-out
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (v: number) => {
    switch (format) {
      case "currency":
        if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
        if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
        return `₹${v.toFixed(0)}`;
      case "percent":
        return `${v.toFixed(1)}%`;
      case "score":
        return `${v.toFixed(0)}/100`;
      default:
        return v.toFixed(0);
    }
  };

  return (
    <div className="glass-panel glow-border p-4 animate-fade-in-up">
      <div className="flex items-start justify-between mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`metric-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p
        className="metric-value"
        style={{ color: color, fontSize: "1.5rem" }}
      >
        {formatValue(displayValue)}
      </p>
      <p
        className="text-xs mt-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
    </div>
  );
}
