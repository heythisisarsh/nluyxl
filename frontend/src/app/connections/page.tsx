"use client";

import React, { useState } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import AskDrawer from "@/components/chat/AskDrawer";
import MascotDefs from "@/components/MascotDefs";

interface Integration {
  id: string;
  name: string;
  category: string;
  status: "connected" | "disconnected";
  icon: string;
  account?: string;
  encrypted: boolean;
}

export default function ConnectionsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "quickbooks",
      name: "QuickBooks Online",
      category: "Accounting & Invoicing",
      status: "connected",
      icon: "🧾",
      account: "Hashira Holdings LLC (Realm ID: 93847291)",
      encrypted: true,
    },
    {
      id: "google_calendar",
      name: "Google Calendar",
      category: "Productivity & Scheduling",
      status: "connected",
      icon: "📅",
      account: "arshinalbab@gmail.com",
      encrypted: true,
    },
    {
      id: "gmail",
      name: "Gmail API",
      category: "Outbound & Inbound Email",
      status: "connected",
      icon: "✉️",
      account: "arshinalbab@gmail.com",
      encrypted: true,
    },
    {
      id: "stripe",
      name: "Stripe Billing",
      category: "Payments & Subscriptions",
      status: "connected",
      icon: "💳",
      account: "acct_1948270192847",
      encrypted: true,
    },
    {
      id: "slack",
      name: "Slack Enterprise",
      category: "Internal Communications",
      status: "connected",
      icon: "💬",
      account: "Hashira Team Workspace (#alerts)",
      encrypted: true,
    },
    {
      id: "linear",
      name: "Linear App",
      category: "Issue & Project Tracking",
      status: "disconnected",
      icon: "⚡",
      encrypted: true,
    },
    {
      id: "github",
      name: "GitHub",
      category: "Code & DevOps",
      status: "disconnected",
      icon: "🐙",
      encrypted: true,
    },
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "connected" ? "disconnected" : "connected";
          return {
            ...item,
            status: nextStatus,
            account: nextStatus === "connected" ? "Authenticated Session" : undefined,
          };
        }
        return item;
      })
    );
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
              <h1 className="text-2xl font-bold tracking-tight">Connected Business Integrations</h1>
              <p className="text-small text-muted">
                Encrypted OAuth tokens protected by AES-256-GCM envelope encryption.
              </p>
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 rounded-full bg-ink text-on-ink text-small font-medium hover:bg-ink-hover shadow-ink transition"
            >
              + Connect Integration
            </button>
          </div>

          {/* Security Banner */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400 font-mono text-sm">🔒</span>
              <div>
                <span className="font-semibold text-text">Zero-Knowledge Key Management Vault</span>
                <p className="text-muted text-[11px] mt-0.5">
                  All access tokens and refresh secrets are encrypted at rest using AES-256-GCM with separate salt per workspace.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
              FIPS 140-2 Level 3
            </span>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-12 w-12 rounded-xl bg-fill border border-white/5 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-small font-semibold text-text truncate">{item.name}</div>
                    <div className="text-[11px] text-muted truncate">{item.category}</div>
                    {item.account && (
                      <div className="text-[10px] text-indigo-400 font-mono truncate mt-0.5">
                        {item.account}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => toggleConnection(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      item.status === "connected"
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {item.status === "connected" ? "Disconnect" : "Connect"}
                  </button>
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
