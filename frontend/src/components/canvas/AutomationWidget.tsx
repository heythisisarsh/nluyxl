"use client";

import React, { useState } from "react";

export default function AutomationWidget({ onOpenAgent }: { onOpenAgent?: () => void }) {
  const [approved, setApproved] = useState(false);

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="text-small font-semibold text-text">Active Routine: Overdue Invoices</h3>
        </div>
        <span className="text-micro font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
          {approved ? "Dispatched" : "HITL Review"}
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between text-small font-semibold text-text">
          <span>Weekly A/R Collections</span>
          <span className="text-micro font-mono text-muted">Schedule: 0 8 * * 1</span>
        </div>

        <p className="text-micro text-muted leading-relaxed">
          QuickBooks audit detected <strong className="text-text">3 unpaid invoices</strong> past 14 days due date ($8,450 total). Payment reminder sequence drafted and staged.
        </p>

        <div className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-emerald-400 border border-white/5 space-y-1">
          <div>• Inv #1042: Acclaim Logistics — $3,200 (19d overdue)</div>
          <div>• Inv #1045: Vertex Labs — $4,100 (16d overdue)</div>
          <div>• Inv #1048: Pioneer Tech — $1,150 (14d overdue)</div>
        </div>

        <div className="flex gap-2 pt-1">
          {approved ? (
            <div className="w-full py-2 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-center text-micro font-medium flex items-center justify-center gap-1.5">
              <span>✓</span>
              <span>Reminders Dispatched via Gmail API (Celery Task #4019)</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => setApproved(true)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-small font-medium transition shadow-sm"
              >
                Approve & Send (3)
              </button>
              <button
                onClick={onOpenAgent}
                className="px-3.5 py-2 rounded-xl bg-fill hover:bg-fill-strong text-muted hover:text-text text-small transition border border-[var(--border)]"
              >
                Details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
