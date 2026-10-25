"use client";

import React, { useState } from "react";

interface SyntheticAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export default function SyntheticAppModal({ isOpen, onClose, initialPrompt = "" }: SyntheticAppModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt || "Create an Expense Approval Tracker for my department");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledApp, setCompiledApp] = useState<{ title: string; category: string; records: any[] } | null>(null);

  const handleCompile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsCompiling(true);

    setTimeout(() => {
      setCompiledApp({
        title: prompt,
        category: "Operations Mini-App",
        records: [
          { id: "EXP-101", requester: "Samir K.", category: "Software Licenses", amount: "$450.00", status: "Pending Approval" },
          { id: "EXP-102", requester: "Sarah L.", category: "Client Entertainment", amount: "$185.50", status: "Approved" },
          { id: "EXP-103", requester: "Devin R.", category: "Cloud Hosting Overages", amount: "$1,240.00", status: "Under Review" },
        ],
      });
      setIsCompiling(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h2 className="text-base font-bold text-text">Synthetic App Compiler</h2>
            </div>
            <p className="text-micro text-muted">
              "Say what you want to see, and the agent builds it into an interactive unit."
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-lg text-subtle hover:text-text hover:bg-fill transition"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <form onSubmit={handleCompile} className="space-y-3">
            <label className="block text-micro font-medium text-muted uppercase tracking-wider">
              Describe what app or tracker you need
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Shift scheduler for 12 technicians, Vendor invoice chaser"
                className="flex-1 h-11 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-text text-small focus:outline-none focus:border-white/20"
              />
              <button
                type="submit"
                disabled={isCompiling || !prompt.trim()}
                className="px-5 py-2 rounded-xl bg-ink text-on-ink text-small font-medium hover:bg-ink-hover disabled:opacity-40 transition shrink-0"
              >
                {isCompiling ? "Compiling..." : "Generate App"}
              </button>
            </div>
          </form>

          {/* COMPILED PREVIEW */}
          {compiledApp ? (
            <div className="p-5 rounded-xl bg-[var(--bg)] border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-small font-semibold text-text">{compiledApp.title}</h3>
                  <span className="text-[10px] font-mono text-indigo-400">{compiledApp.category} · Ready for Canvas</span>
                </div>
                <button
                  onClick={() => {
                    alert("App pinned to your 12-column Home Canvas!");
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-micro font-medium transition"
                >
                  Pin to Canvas
                </button>
              </div>

              {/* Table */}
              <div className="rounded-lg border border-[var(--border)] overflow-hidden text-micro">
                <table className="w-full text-left">
                  <thead className="bg-[var(--surface)] text-muted uppercase text-[10px] font-mono border-b border-[var(--border)]">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Requester</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {compiledApp.records.map((r) => (
                      <tr key={r.id} className="hover:bg-fill/40">
                        <td className="p-2.5 font-mono text-muted">{r.id}</td>
                        <td className="p-2.5 font-medium text-text">{r.requester}</td>
                        <td className="p-2.5 text-muted">{r.category}</td>
                        <td className="p-2.5 font-mono font-semibold text-text">{r.amount}</td>
                        <td className="p-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            r.status === "Approved" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : isCompiling ? (
            <div className="h-44 flex flex-col items-center justify-center space-y-3">
              <span className="h-3 w-3 rounded-full bg-indigo-400 animate-ping" />
              <div className="text-small text-muted font-medium">Synthesizing mini-app layout & schemas...</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
