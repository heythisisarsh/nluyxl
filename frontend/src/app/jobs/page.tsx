"use client";

import React, { useState } from "react";
import { Briefcase, Play, Pause, Clock, AlertCircle, Plus, Check } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([
    {
      id: "job_01",
      title: "Weekly Overdue Invoice Follow-up",
      instruction: "Scan QuickBooks every Monday at 8 AM. Draft payment reminder emails for any invoice > 14 days late.",
      cron: "0 8 * * 1",
      requiresApproval: true,
      status: "active",
      lastRun: "Yesterday at 8:00 AM",
      pendingApprovals: 3
    },
    {
      id: "job_02",
      title: "Emergency Inbound Triage",
      instruction: "Monitor inbound support mailbox. If email contains 'no heat' or 'leak', dispatch nearest available technician within 15 mins.",
      cron: "Realtime Webhook",
      requiresApproval: false,
      status: "active",
      lastRun: "2 hours ago",
      pendingApprovals: 0
    }
  ]);

  return (
    <div className="flex-1 p-8 min-h-screen bg-slate-950 text-white overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automated Jobs & Background Routines</h1>
          <p className="text-xs text-slate-400 mt-1">Autonomous crons and event triggers running across your business tools.</p>
        </div>
        <button
          onClick={() => alert("Ask @Plyxl: e.g. 'Every Friday at 5 PM export a sales summary to Slack'")}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Automated Job</span>
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-start justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-white text-sm">{job.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono">
                  {job.status}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-mono">
                  {job.cron}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{job.instruction}</p>
              <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last run: {job.lastRun}</span>
                </span>
                {job.pendingApprovals > 0 && (
                  <span className="flex items-center space-x-1 text-amber-400 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{job.pendingApprovals} actions waiting for approval</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                <Pause className="h-4 w-4" />
              </button>
              <button
                onClick={() => alert(`Triggered manual execution of ${job.title}`)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Run Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
