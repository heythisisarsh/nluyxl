"use client";

import React, { useState } from "react";

export default function FinancialWidget() {
  const [timeframe, setTimeframe] = useState<"30d" | "90d" | "1y">("30d");

  const dataPoints = [
    { label: "Aug", mrr: 34.2, expenses: 18.5 },
    { label: "Sep", mrr: 38.6, expenses: 20.1 },
    { label: "Oct", mrr: 42.8, expenses: 21.4 },
    { label: "Nov (Proj)", mrr: 47.5, expenses: 22.0 },
  ];

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h3 className="text-small font-semibold text-text">Financial Pulse & Cashflow</h3>
          </div>
          <p className="text-micro text-muted mt-0.5">QuickBooks & Stripe live ledger sync</p>
        </div>

        <div className="flex p-0.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-micro">
          {(["30d", "90d", "1y"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2 py-0.5 rounded-md transition ${
                timeframe === t ? "bg-fill text-text font-medium" : "text-muted hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-text">$42,850</span>
        <span className="text-micro font-semibold text-emerald-400 flex items-center gap-0.5">
          ▲ +12.4% <span className="text-muted font-normal">vs last month</span>
        </span>
      </div>

      {/* SVG REVENUE GRAPH */}
      <div className="h-28 w-full pt-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Fill area */}
          <path
            d="M 0,85 Q 100,65 200,45 T 400,15 L 400,100 L 0,100 Z"
            fill="url(#mrrGrad)"
          />
          {/* Stroke Line */}
          <path
            d="M 0,85 Q 100,65 200,45 T 400,15"
            fill="none"
            stroke="#818cf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Dots */}
          <circle cx="0" cy="85" r="3.5" fill="#818cf8" />
          <circle cx="130" cy="60" r="3.5" fill="#818cf8" />
          <circle cx="260" cy="35" r="3.5" fill="#818cf8" />
          <circle cx="400" cy="15" r="4.5" fill="#a5b4fc" className="animate-pulse" />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border)] text-micro font-mono">
        <div>
          <span className="text-muted">Net ARR:</span> <span className="text-text font-semibold">$514k</span>
        </div>
        <div>
          <span className="text-muted">Burn Rate:</span> <span className="text-text font-semibold">$21.4k/mo</span>
        </div>
        <div>
          <span className="text-muted">Runway:</span> <span className="text-emerald-400 font-semibold">28 Mo</span>
        </div>
      </div>
    </div>
  );
}
