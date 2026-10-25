"use client";

import React, { useState } from "react";
import { Layers, CheckCircle2, AlertCircle, Plus, ExternalLink } from "lucide-react";

export default function ConnectionsPage() {
  const [integrations, setIntegrations] = useState([
    { id: "google", name: "Google Workspace", desc: "Gmail, Google Calendar & Drive", status: "connected", icon: "🔴", account: "arshinalbab@gmail.com" },
    { id: "quickbooks", name: "QuickBooks Online", desc: "Invoicing, receivables & expenses", status: "connected", icon: "🟢", account: "Hashira HVAC LLC" },
    { id: "slack", name: "Slack", desc: "Team channels, direct notifications & @Plyxl bot", status: "connected", icon: "🟣", account: "#operations-team" },
    { id: "linear", name: "Linear", desc: "Issue tracking & engineering tasks", status: "disconnected", icon: "⚫", account: null },
    { id: "hubspot", name: "HubSpot CRM", desc: "Lead tracking & contact management", status: "disconnected", icon: "🟠", account: null },
  ]);

  return (
    <div className="flex-1 p-8 min-h-screen bg-slate-950 text-white overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connected Tools & Integrations</h1>
          <p className="text-xs text-slate-400 mt-1">Connect your real business software so @Plyxl can perform cross-app actions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrations.map((item) => (
          <div key={item.id} className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-start justify-between hover:border-slate-700 transition">
            <div className="flex items-start space-x-3.5">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  {item.status === "connected" ? (
                    <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                      Disconnected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                {item.account && (
                  <div className="text-[11px] text-indigo-400 font-mono mt-2">
                    Account: {item.account}
                  </div>
                )}
              </div>
            </div>

            <div>
              {item.status === "connected" ? (
                <button
                  onClick={() => alert(`Configuring ${item.name}`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Manage
                </button>
              ) : (
                <button
                  onClick={() => alert(`Initiating OAuth PKCE connect for ${item.name}`)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
