"use client";

import React, { useMemo } from "react";

interface VelocityData {
  current_net_worth: number;
  monthly_velocity: number;
  savings_rate: number;
  projections: number[];
  optimistic: number[];
  pessimistic: number[];
  annual_projected: number;
  velocity_score: number;
}

const defaultData: VelocityData = {
  current_net_worth: 850000,
  monthly_velocity: 33000,
  savings_rate: 38.8,
  projections: [883000,916600,950800,985700,1021200,1057400,1094300,1131900,1170200,1209300,1249100,1289800],
  optimistic: [890000,932000,976000,1022000,1070000,1120000,1172000,1226000,1282000,1340000,1401000,1464000],
  pessimistic: [876000,903000,930000,958000,986000,1014000,1043000,1072000,1101000,1131000,1162000,1193000],
  annual_projected: 1289800,
  velocity_score: 77.6,
};

export default function NetWorthVelocity({ data }: { data?: VelocityData }) {
  const v = data || defaultData;
  const months = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];
  const growth = v.current_net_worth > 0 ? ((v.annual_projected - v.current_net_worth) / v.current_net_worth) * 100 : 0;

  const paths = useMemo(() => {
    const W = 500, H = 140, pt = 10, pb = 20;
    const cH = H - pt - pb;
    const all = [...v.projections, ...v.optimistic, ...v.pessimistic];
    const mn = Math.min(...all) * 0.98, mx = Math.max(...all) * 1.02;
    const toX = (i: number) => (i / (v.projections.length - 1)) * W;
    const toY = (val: number) => pt + cH - ((val - mn) / (mx - mn)) * cH;
    const mkPath = (arr: number[]) => arr.map((val, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(val)}`).join(" ");
    const aT = v.optimistic.map((val, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(val)}`).join(" ");
    const aB = [...v.pessimistic].reverse().map((val, i) => `L ${toX(v.pessimistic.length - 1 - i)} ${toY(val)}`).join(" ");
    return { main: mkPath(v.projections), opt: mkPath(v.optimistic), pess: mkPath(v.pessimistic), area: `${aT} ${aB} Z` };
  }, [v]);

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: "rgba(16,185,129,0.15)" }}>📈</div>
          <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>Net Worth Velocity</h3>
        </div>
        <div className={`metric-trend ${growth >= 0 ? "up" : "down"}`}>{growth >= 0 ? "▲" : "▼"} {Math.abs(growth).toFixed(1)}% /yr</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div><p className="text-[10px]" style={{color:"var(--text-muted)"}}>Current</p><p className="text-sm font-bold" style={{fontFamily:"var(--font-display)"}}>₹{(v.current_net_worth/100000).toFixed(1)}L</p></div>
        <div><p className="text-[10px]" style={{color:"var(--text-muted)"}}>Velocity</p><p className="text-sm font-bold" style={{color:"var(--accent-emerald)"}}>+₹{(v.monthly_velocity/1000).toFixed(0)}K/mo</p></div>
        <div><p className="text-[10px]" style={{color:"var(--text-muted)"}}>12M Target</p><p className="text-sm font-bold" style={{color:"var(--accent-cyan)"}}>₹{(v.annual_projected/100000).toFixed(1)}L</p></div>
      </div>
      <svg viewBox="0 0 500 160" className="w-full" style={{height:"140px"}}>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1"/><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.01"/></linearGradient>
        </defs>
        <path d={paths.area} fill="url(#ag)"/>
        <path d={paths.pess} fill="none" stroke="#F43F5E" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
        <path d={paths.opt} fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
        <path d={paths.main} fill="none" stroke="url(#pg)" strokeWidth="2.5" strokeLinecap="round"/>
        {months.map((m,i) => i%2===0 ? <text key={m} x={(i/(months.length-1))*500} y={155} textAnchor="middle" fill="#64748B" fontSize="8">{m}</text> : null)}
      </svg>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-[10px]" style={{color:"var(--text-muted)"}}>Velocity Score</span>
        <div className="flex-1 h-2 rounded-full" style={{background:"var(--bg-tertiary)"}}><div className="h-full rounded-full" style={{width:`${v.velocity_score}%`,background:"var(--gradient-primary)"}}/></div>
        <span className="text-xs font-bold" style={{fontFamily:"var(--font-mono)",color:"var(--accent-purple)"}}>{v.velocity_score}</span>
      </div>
    </div>
  );
}
