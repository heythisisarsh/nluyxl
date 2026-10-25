"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import AskDrawer from "@/components/chat/AskDrawer";
import MascotDefs from "@/components/MascotDefs";
import { SheepIcon } from "@/components/Mascot";
import { useTenant } from "@/context/TenantContext";

interface Job {
  id: string;
  title: string;
  instruction: string;
  cron_expression: string;
  status: string;
  created_at?: string;
}

export default function JobsPage() {
  const { currentOrg } = useTenant();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newInstruction, setNewInstruction] = useState("");
  const [newCron, setNewCron] = useState("0 8 * * 1");
  const [runningJobId, setRunningJobId] = useState<string | null>(null);

  const orgId = currentOrg?.id || "org_hashira";

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/jobs`);
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (e) {
      console.error("Failed to load jobs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [orgId]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch(`/api/orgs/${orgId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          instruction: newInstruction.trim(),
          cron_expression: newCron,
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle("");
        setNewInstruction("");
        await fetchJobs();
      }
    } catch (err) {
      alert("Failed to create job");
    }
  };

  const handleRunJob = async (jobId: string) => {
    setRunningJobId(jobId);
    try {
      const res = await fetch(`/api/orgs/${orgId}/jobs/${jobId}/run`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        alert(`✓ Job Run Completed!\n\n${data.output}`);
      }
    } catch (err) {
      alert("Failed to execute job");
    } finally {
      setRunningJobId(null);
    }
  };

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
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentOrg?.name || "Hashira"} Autonomous Jobs
                </h1>
              </div>
              <p className="text-small text-muted">
                Isolated background cron routines stored in <code className="text-indigo-400 font-mono text-micro">{orgId}.db</code>
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
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
                <div className="text-small font-medium text-text">Celery Worker Node: Connected to {currentOrg?.name || "Hashira"}</div>
                <div className="text-micro text-muted">Dedicated SQLite queue active · Beat scheduler heartbeat online</div>
              </div>
            </div>
            <span className="text-micro font-mono px-2.5 py-1 rounded bg-fill text-emerald-400 border border-white/5">
              Isolated Tenant DB
            </span>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center text-muted text-small">Loading tenant background routines...</div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center text-muted text-small border border-dashed border-[var(--border)] rounded-2xl">
                No routines scheduled yet for {currentOrg?.name}. Click "+ Propose New Routine" to create one.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-white/10 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-base font-semibold text-text">{job.title}</div>
                      <div className="text-small text-muted mt-0.5">{job.instruction}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-micro font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active Routine
                      </span>

                      <button
                        onClick={() => handleRunJob(job.id)}
                        disabled={runningJobId === job.id}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-micro font-medium transition"
                      >
                        {runningJobId === job.id ? "Running..." : "▶ Run Now"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--border)] text-micro font-mono text-muted">
                    <div>
                      <span className="text-subtle uppercase">Cron Expression:</span>{" "}
                      <span className="text-text">{job.cron_expression}</span>
                    </div>
                    <div>
                      <span className="text-subtle uppercase">Target Tenant DB:</span>{" "}
                      <span className="text-indigo-400">{orgId}.db</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE JOB MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-text">Propose Autonomous Routine</h2>
              <p className="text-small text-muted mt-1">
                Schedules a recurring background job in {currentOrg?.name || "Hashira"}'s isolated SQLite database.
              </p>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-micro font-medium text-muted uppercase tracking-wider mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Inventory Reconciliation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-text text-small focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="block text-micro font-medium text-muted uppercase tracking-wider mb-1">
                  Agent Instruction
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Scan Shopify orders every midnight and flag cancelled items to logistics channel."
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-text text-small focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-micro font-medium text-muted uppercase tracking-wider mb-1">
                  Cron Schedule
                </label>
                <select
                  value={newCron}
                  onChange={(e) => setNewCron(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-text text-small focus:outline-none focus:border-white/20"
                >
                  <option value="0 8 * * 1">Every Monday at 8:00 AM (0 8 * * 1)</option>
                  <option value="0 9 * * *">Every Day at 9:00 AM (0 9 * * *)</option>
                  <option value="0 0 * * *">Every Midnight (0 0 * * *)</option>
                  <option value="*/15 * * * *">Every 15 Minutes (*/15 * * * *)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-small text-muted hover:text-text hover:bg-fill transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-ink text-on-ink text-small font-medium hover:bg-ink-hover transition"
                >
                  Save & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AskDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
