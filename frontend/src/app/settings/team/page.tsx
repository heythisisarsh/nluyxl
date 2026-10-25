"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/navigation/Sidebar";
import MascotDefs from "@/components/MascotDefs";
import { useTenant } from "@/context/TenantContext";

interface Member {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  joined_at: string;
}

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  credits_monthly: number;
  max_members: number;
  features: string[];
}

interface BillingSummary {
  org_id: string;
  plan_id: string;
  plan_name: string;
  price_monthly: number;
  credits_used: number;
  credits_limit: number;
  credits_percent: number;
  member_count: number;
  max_members: number;
  features: string[];
}

export default function TeamSettingsPage() {
  const { currentOrg, refreshOrg } = useTenant();
  const [activeTab, setActiveTab] = useState<"members" | "billing">("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<BillingSummary | null>(null);

  // Invite member form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planUpdating, setPlanUpdating] = useState<string | null>(null);

  const orgId = currentOrg?.id || "org_hashira";

  const loadData = async () => {
    try {
      // Load members
      const memRes = await fetch(`/api/orgs/${orgId}/members`);
      if (memRes.ok) setMembers(await memRes.json());

      // Load plans
      const plansRes = await fetch("/api/plans");
      if (plansRes.ok) setPlans(await plansRes.json());

      // Load billing
      const billRes = await fetch(`/api/orgs/${orgId}/billing`);
      if (billRes.ok) setBilling(await billRes.json());
    } catch (e) {
      console.error("Failed to load team data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orgs/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          full_name: inviteName.trim() || undefined,
          role: inviteRole,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add member");
      }
      setInviteEmail("");
      setInviteName("");
      await loadData();
      await refreshOrg();
    } catch (err: any) {
      alert(err.message || "Failed to add member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`/api/orgs/${orgId}/members/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to remove member");
      }
      await loadData();
      await refreshOrg();
    } catch (err: any) {
      alert(err.message || "Failed to remove member");
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (billing?.plan_id === planId) return;
    setPlanUpdating(planId);
    try {
      const res = await fetch(`/api/orgs/${orgId}/billing/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to change plan");
      }
      await loadData();
      await refreshOrg();
    } catch (err: any) {
      alert(err.message || "Failed to change plan");
    } finally {
      setPlanUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex overflow-hidden">
      <MascotDefs />
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link href="/home" className="text-muted hover:text-text text-small transition flex items-center gap-1">
                  ← Back to Canvas
                </Link>
              </div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
                <span>{currentOrg?.name || "Hashira"}</span>
                <span className="text-micro font-mono uppercase px-2 py-0.5 rounded bg-fill text-indigo-400 border border-white/5">
                  Tenant: {orgId}
                </span>
              </h1>
              <p className="text-small text-muted">
                Multi-tenant organization settings: Isolated SQLite storage, team members, and billing tier.
              </p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] self-start sm:self-center">
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-1.5 rounded-lg text-small font-medium transition ${
                  activeTab === "members" ? "bg-fill text-text shadow-sm" : "text-muted hover:text-text"
                }`}
              >
                Team Members ({members.length})
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`px-4 py-1.5 rounded-lg text-small font-medium transition ${
                  activeTab === "billing" ? "bg-fill text-text shadow-sm" : "text-muted hover:text-text"
                }`}
              >
                Plans & Billing
              </button>
            </div>
          </div>

          {/* TAB 1: MEMBERS MANAGEMENT */}
          {activeTab === "members" && (
            <div className="space-y-8">
              {/* INVITE FORM */}
              <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-text">Add Team Member</h2>
                  <p className="text-small text-muted mt-0.5">
                    Assign teammates to collaborate in this tenant's autonomous workspace.
                  </p>
                </div>

                <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-micro font-medium text-muted uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Chen"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-text text-small focus:outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-micro font-medium text-muted uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="maya@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-text text-small focus:outline-none focus:border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-micro font-medium text-muted uppercase tracking-wider mb-1">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-text text-small focus:outline-none focus:border-white/20"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !inviteEmail.trim()}
                      className="px-5 py-2 rounded-xl bg-ink text-on-ink text-small font-medium hover:bg-ink-hover disabled:opacity-40 transition"
                    >
                      {isSubmitting ? "Adding..." : "+ Add Member"}
                    </button>
                  </div>
                </form>
              </div>

              {/* MEMBERS TABLE */}
              <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-small font-semibold text-text">Active Organization Members</span>
                  <span className="text-micro text-muted font-mono">
                    {members.length} / {billing?.max_members || 3} Seats Used
                  </span>
                </div>

                <div className="divide-y divide-[var(--border)]">
                  {members.map((m) => (
                    <div key={m.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-fill/40 transition">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-slate-800 text-text font-bold text-sm flex items-center justify-center border border-white/10 shrink-0">
                          {m.full_name[0] || m.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-small font-medium text-text truncate">{m.full_name}</div>
                          <div className="text-[11px] text-muted truncate">{m.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-micro font-medium uppercase tracking-wider ${
                            m.role === "owner"
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                              : m.role === "admin"
                              ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/60"
                              : "bg-fill text-muted"
                          }`}
                        >
                          {m.role}
                        </span>

                        {m.role !== "owner" && (
                          <button
                            onClick={() => handleRemoveMember(m.user_id)}
                            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-950/40 transition text-micro"
                            title="Remove Member"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLANS & BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-8">
              {/* CREDITS QUOTA OVERVIEW */}
              {billing && (
                <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-micro font-semibold uppercase tracking-wider text-muted">
                        Active Subscription Tier
                      </span>
                      <h2 className="text-xl font-bold text-text mt-0.5">{billing.plan_name}</h2>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-text">
                        ${billing.price_monthly} <span className="text-small text-muted font-normal">/ month</span>
                      </div>
                      <div className="text-micro text-emerald-400 font-mono">Auto-renews monthly</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-micro text-muted">
                      <span>Monthly AI Credits Usage</span>
                      <span className="font-mono text-text">
                        {billing.credits_used.toLocaleString()} / {billing.credits_limit.toLocaleString()} ({billing.credits_percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(billing.credits_percent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TIER SELECTION CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((p) => {
                  const isCurrent = billing?.plan_id === p.id;
                  const isUpdating = planUpdating === p.id;

                  return (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-5 ${
                        isCurrent
                          ? "bg-[var(--surface)] border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg"
                          : "bg-[var(--surface)] border-[var(--border)] hover:border-white/20"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-base text-text">{p.name}</h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-micro font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="text-2xl font-extrabold text-text">
                          ${p.price_monthly}
                          <span className="text-xs text-muted font-normal"> /mo</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-micro font-mono text-muted space-y-1">
                          <div className="text-emerald-400 font-semibold">{p.credits_monthly.toLocaleString()} Credits</div>
                          <div>Up to {p.max_members} Team Members</div>
                        </div>

                        <ul className="space-y-2 pt-2 text-micro text-muted">
                          {p.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="text-emerald-400">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleSelectPlan(p.id)}
                        disabled={isCurrent || isUpdating}
                        className={`w-full py-2 rounded-xl text-small font-medium transition ${
                          isCurrent
                            ? "bg-fill text-muted cursor-default"
                            : "bg-ink text-on-ink hover:bg-ink-hover shadow-ink"
                        }`}
                      >
                        {isUpdating ? "Switching..." : isCurrent ? "Active Plan" : "Choose Plan"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
