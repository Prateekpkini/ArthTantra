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
    <div className="glass-panel p-6 relative overflow-hidden" style={{ background: "rgba(11,17,33,0.3)" }}>
      {/* Glow orb */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: "rgba(6, 182, 212, 0.1)" }}></div>
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg glow-border" style={{ background: "var(--bg-tertiary)" }}>
            <span style={{ color: "var(--accent-emerald)" }}>📈</span>
          </div>
          <h3 className="text-md font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Net Worth Velocity</h3>
        </div>
        <div className={`metric-trend ${growth >= 0 ? "up" : "down"} px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md`} style={{ background: growth >= 0 ? "rgba(52, 211, 153, 0.15)" : "rgba(244, 63, 94, 0.15)", border: `1px solid ${growth >= 0 ? "rgba(52, 211, 153, 0.3)" : "rgba(244, 63, 94, 0.3)"}` }}>
          {growth >= 0 ? "▲" : "▼"} {Math.abs(growth).toFixed(1)}% /yr
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
        <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:"var(--text-muted)"}}>Current</p>
          <p className="text-lg font-black tracking-tight" style={{fontFamily:"var(--font-display)", color: "var(--text-primary)"}}>₹{(v.current_net_worth/100000).toFixed(1)}L</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.1)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:"var(--text-muted)"}}>Velocity</p>
          <p className="text-lg font-black tracking-tight" style={{color:"var(--accent-emerald)", textShadow: "0 0 10px rgba(52,211,153,0.3)"}}>+₹{(v.monthly_velocity/1000).toFixed(0)}K<span className="text-xs">/mo</span></p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(34, 211, 238, 0.05)", border: "1px solid rgba(34, 211, 238, 0.1)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:"var(--text-muted)"}}>12M Target</p>
          <p className="text-lg font-black tracking-tight" style={{color:"var(--accent-cyan)", textShadow: "0 0 10px rgba(34,211,238,0.3)"}}>₹{(v.annual_projected/100000).toFixed(1)}L</p>
        </div>
      </div>
      
      <svg viewBox="0 0 500 160" className="w-full relative z-10" style={{height:"150px", overflow: "visible"}}>
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22D3EE"/>
            <stop offset="50%" stopColor="#818CF8"/>
            <stop offset="100%" stopColor="#9F7AEA"/>
          </linearGradient>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0"/>
          </linearGradient>
          <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path d={paths.area} fill="url(#ag)"/>
        
        {/* Animated paths */}
        <path d={paths.pess} fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" style={{ animation: "dash 30s linear infinite" }}/>
        <path d={paths.opt} fill="none" stroke="#34D399" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" style={{ animation: "dash 30s linear infinite reverse" }}/>
        <path d={paths.main} fill="none" stroke="url(#pg)" strokeWidth="3" strokeLinecap="round" filter="url(#line-glow)" />
        
        {/* Glow dots on main path */}
        {v.projections.map((val, i) => i % 3 === 0 ? (
           <circle key={i} cx={(i / (v.projections.length - 1)) * 500} cy={10 + 130 - ((val - Math.min(...[...v.projections, ...v.optimistic, ...v.pessimistic]) * 0.98) / (Math.max(...[...v.projections, ...v.optimistic, ...v.pessimistic]) * 1.02 - Math.min(...[...v.projections, ...v.optimistic, ...v.pessimistic]) * 0.98)) * 130} r="3" fill="#fff" filter="url(#line-glow)"/>
        ) : null)}

        {months.map((m,i) => i%2===0 ? <text key={m} x={(i/(months.length-1))*500} y={155} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontWeight="bold" letterSpacing="0.1em">{m}</text> : null)}
      </svg>
      
      <div className="flex items-center gap-4 mt-6 relative z-10 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:"var(--text-muted)"}}>Velocity Score</span>
        <div className="flex-1 h-2.5 rounded-full relative overflow-hidden" style={{background:"var(--bg-tertiary)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)"}}>
          <div className="h-full rounded-full relative" style={{width:`${v.velocity_score}%`,background:"var(--gradient-primary)", boxShadow: "0 0 10px rgba(129, 140, 248, 0.5)"}}>
            <div className="absolute inset-0 w-full h-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", animation: "shimmer 2s infinite" }}></div>
          </div>
        </div>
        <span className="text-lg font-black" style={{fontFamily:"var(--font-display)",color:"var(--accent-cyan)", textShadow: "0 0 10px rgba(34, 211, 238, 0.3)"}}>{v.velocity_score}</span>
      </div>
    </div>
  );
}
