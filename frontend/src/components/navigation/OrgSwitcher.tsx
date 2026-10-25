"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";

export default function OrgSwitcher() {
  const { currentOrg, organizations, switchOrg, createOrg } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    setIsCreating(true);
    try {
      await createOrg(newOrgName.trim());
      setNewOrgName("");
      setShowCreateModal(false);
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create organization");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-7 pl-2 pr-2 rounded-md text-small font-medium text-text hover:bg-fill transition-colors max-w-[160px] truncate"
      >
        <span className="h-4 w-4 rounded bg-indigo-600/80 text-[10px] flex items-center justify-center font-bold text-white shrink-0">
          {currentOrg?.name?.[0] || "H"}
        </span>
        <span className="truncate">{currentOrg?.name || "Hashira"}</span>
        <svg className="h-3 w-3 text-subtle shrink-0" fill="currentColor" viewBox="0 0 256 256">
          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
        </svg>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl py-1.5 z-50 text-small">
            <div className="px-3 py-1.5 text-micro font-semibold uppercase tracking-wider text-muted">
              Select Organization
            </div>

            <div className="max-h-48 overflow-y-auto space-y-0.5 px-1">
              {organizations.map((org) => {
                const isActive = org.id === currentOrg?.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrg(org.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      isActive ? "bg-fill text-text font-medium" : "text-muted hover:text-text hover:bg-fill"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-5 w-5 rounded bg-slate-800 text-micro flex items-center justify-center font-bold text-white shrink-0">
                        {org.name[0]}
                      </span>
                      <span className="truncate">{org.name}</span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-1.5 border-t border-[var(--border)]" />

            <div className="px-1 space-y-0.5">
              <Link
                href="/settings/team"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted hover:text-text hover:bg-fill transition text-left"
              >
                <span>⚙️</span>
                <span>Team & Billing Settings</span>
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-fill transition text-left"
              >
                <span>+</span>
                <span>Create New Organization</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* CREATE ORG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-text">Create Organization</h2>
              <p className="text-small text-muted mt-1">
                Provisions an isolated SQLite database container with its own team members and business data.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-micro font-medium text-muted uppercase tracking-wider mb-1.5">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Innovations"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-text text-small focus:outline-none focus:border-white/20"
                />
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
                  disabled={isCreating || !newOrgName.trim()}
                  className="px-4 py-2 rounded-xl bg-ink text-on-ink text-small font-medium hover:bg-ink-hover disabled:opacity-40 transition"
                >
                  {isCreating ? "Provisioning DB..." : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
