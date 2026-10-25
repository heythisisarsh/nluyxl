"use client";

import React, { useState } from "react";

export default function MailboxWidget({ onDraftReply }: { onDraftReply?: (subject: string, sender: string) => void }) {
  const [threads, setThreads] = useState([
    {
      id: "th_01",
      sender: "Marcus at Harbourview",
      email: "marcus@harbourview.io",
      subject: "Commercial lease overhaul & HVAC maintenance contract",
      preview: "Hi Arshin, can your team review the amended scope and approve the schedule?",
      time: "18m ago",
      status: "action_needed",
    },
    {
      id: "th_02",
      sender: "Elena at Cedar Park",
      email: "elena@cedarpark.co",
      subject: "Invoice #1094 discrepancy follow-up",
      preview: "We noticed the credit applied on line 3 doesn't match our purchase order.",
      time: "1h ago",
      status: "draft_ready",
    },
    {
      id: "th_03",
      sender: "Stripe Billing Alert",
      email: "notifications@stripe.com",
      subject: "Payout of $14,280.00 processed",
      preview: "Funds are scheduled to arrive in your Chase account by Oct 27.",
      time: "3h ago",
      status: "synced",
    },
  ]);

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <h3 className="text-small font-semibold text-text">Priority Mailbox Triage</h3>
        </div>
        <span className="text-micro font-mono px-2 py-0.5 rounded bg-fill text-muted">
          Gmail API Connected
        </span>
      </div>

      <div className="space-y-2.5">
        {threads.map((t) => (
          <div
            key={t.id}
            className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-white/10 transition space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-small font-medium text-text truncate max-w-[200px]">
                {t.sender}
              </span>
              <span className="text-micro text-muted font-mono">{t.time}</span>
            </div>

            <div className="text-micro text-indigo-300 font-medium truncate">{t.subject}</div>
            <p className="text-micro text-muted line-clamp-1 leading-relaxed">{t.preview}</p>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => onDraftReply?.(t.subject, t.sender)}
                className="px-2.5 py-1 rounded-lg bg-fill hover:bg-fill-strong text-micro font-medium text-text border border-[var(--border)] transition flex items-center gap-1.5"
              >
                <span>✨</span>
                <span>Draft AI Reply</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
