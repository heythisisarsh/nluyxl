"use client";

import React, { useState } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import AskDrawer from "@/components/chat/AskDrawer";
import MascotDefs from "@/components/MascotDefs";
import { SheepIcon } from "@/components/Mascot";

interface Job {
  id: string;
  title: string;
  instruction: string;
  cron: string;
  scheduleHuman: string;
  status: "active" | "approval_required" | "paused";
  lastRun: string;
  nextRun: string;
}

export default function JobsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "job-001",
      title: "Weekly Overdue Invoicing Follow-up",
      instruction: "Scan QuickBooks for unpaid invoices > 14 days and send reminder email sequence.",
      cron: "0 8 * * 1",
      scheduleHuman: "Every Monday at 8:00 AM UTC",
      status: "active",
      lastRun: "2026-10-19 08:00:00 UTC",
      nextRun: "2026-10-26 08:00:00 UTC",
    },
    {
      id: "job-002",
      title: "Daily Executive Financial Pulse",
      instruction: "Query Stripe and QuickBooks API to aggregate cashflow, MRR, and new accounts.",
      cron: "0 9 * * *",
      scheduleHuman: "Every day at 9:00 AM UTC",
      status: "active",
      lastRun: "2026-10-25 09:00:00 UTC",
      nextRun: "2026-10-26 09:00:00 UTC",
    },
    {
      id: "job-003",
      title: "Weekly Calendar & Team Standup Sync",
      instruction: "Review Google Calendar events and draft priority briefing on Slack.",
      cron: "0 10 * * 1",
      scheduleHuman: "Every Monday at 10:00 AM UTC",
      status: "approval_required",
      lastRun: "Never",
      nextRun: "Pending Approval",
    },
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex overflow-hidden">
      <MascotDefs />
      <Sidebar onOpenNewChat={() => setIsDrawerOpen(true)} />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SheepIcon size={22} />
                <h1 className="text-2xl font-bold tracking-tight">Autonomous Background Jobs</h1>
              </div>
              <p className="text-small text-muted">
                Recurring business automations orchestrated by Hashira Celery & Beat daemons.
              </p>
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 rounded-full bg-ink text-on-ink text-small font-medium hover:bg-ink-hover shadow-ink transition flex items-center gap-2"
            >
              <span>+ Propose New Routine</span>
              <kbd className="opacity-60 text-[10px]">⌘J</kbd>
            </button>
          </div>

          {/* Celery Worker Status Banner */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-small font-medium text-text">Celery Worker Node nyc3-01: Online</div>
                <div className="text-micro text-muted">Redis 7 Broker connected · Beat scheduler active (UTC)</div>
              </div>
            </div>
            <span className="text-micro font-mono px-2 py-0.5 rounded bg-fill text-muted">
              Concurrency: 2 workers
            </span>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-white/10 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold text-text">{job.title}</div>
                    <div className="text-small text-muted mt-0.5">{job.instruction}</div>
                  </div>
                  <div>
                    {job.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-micro font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active Routine
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-micro font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                        Approval Required
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--border)] text-micro font-mono text-muted">
                  <div>
                    <span className="text-subtle uppercase">Schedule:</span>{" "}
                    <span className="text-text">{job.scheduleHuman}</span>
                  </div>
                  <div>
                    <span className="text-subtle uppercase">Cron:</span>{" "}
                    <span className="text-text">{job.cron}</span>
                  </div>
                  <div>
                    <span className="text-subtle uppercase">Next Trigger:</span>{" "}
                    <span className="text-text">{job.nextRun}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AskDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
