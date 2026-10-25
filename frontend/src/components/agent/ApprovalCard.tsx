"use client";

import React, { useState } from "react";
import { ShieldAlert, Check, X, Edit2 } from "lucide-react";

interface ApprovalCardProps {
  card: {
    title: string;
    description: string;
    diff_preview: string;
    action_id: string;
    risk: string;
  };
  onApprove: (actionId: string) => void;
  onCancel: (actionId: string) => void;
}

export function ApprovalCard({ card, onApprove, onCancel }: ApprovalCardProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "cancelled">("pending");

  const handleApprove = () => {
    setStatus("approved");
    onApprove(card.action_id);
  };

  const handleCancel = () => {
    setStatus("cancelled");
    onCancel(card.action_id);
  };

  if (status === "approved") {
    return (
      <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 my-2">
        <Check className="h-4 w-4 text-emerald-400" />
        <span>Action approved & executed. Audit log recorded.</span>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center space-x-2 my-2">
        <X className="h-4 w-4 text-rose-400" />
        <span>Action cancelled by user. No external write performed.</span>
      </div>
    );
  }

  return (
    <div className="my-3 p-4 bg-slate-900 border border-amber-500/40 rounded-xl shadow-lg shadow-amber-500/5 text-xs text-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold">
          <ShieldAlert className="h-4 w-4" />
          <span>{card.title}</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
          Risk: {card.risk}
        </span>
      </div>

      <p className="text-slate-300 text-xs mb-3">{card.description}</p>

      {card.diff_preview && (
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 mb-3 whitespace-pre-wrap">
          {card.diff_preview}
        </div>
      )}

      <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
        <button
          onClick={handleApprove}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Approve & Send</span>
        </button>
        <button
          onClick={() => alert("Edit modal opened: adjust message text inline.")}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center space-x-1 transition"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 rounded-lg flex items-center space-x-1 transition"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
