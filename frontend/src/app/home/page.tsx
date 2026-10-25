"use client";

import React, { useState } from "react";
import Sidebar from "@/components/navigation/Sidebar";
import AskDrawer from "@/components/chat/AskDrawer";
import MascotDefs from "@/components/MascotDefs";
import { PlyxlLogo } from "@/components/Mascot";

export default function HomePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const quickPills = [
    { label: "Chase overdue invoices (>14d)", prompt: "Every Monday at 8 chase overdue invoices" },
    { label: "Summarize weekly revenue metrics", prompt: "Check revenue metrics for Q3" },
    { label: "Sync Google Calendar & book sync", prompt: "Schedule a team meeting tomorrow at 2pm" },
    { label: "Connect QuickBooks & Stripe", prompt: "Audit active billing connections and check sync status" },
  ];

  const appTiles = [
    { id: "quickbooks", name: "Invoices", icon: "🧾", bg: "bg-emerald-950/60 border-emerald-800/40 text-emerald-300" },
    { id: "calendar", name: "Calendar", icon: "📅", bg: "bg-blue-950/60 border-blue-800/40 text-blue-300" },
    { id: "mail", name: "Gmail", icon: "✉️", bg: "bg-red-950/60 border-red-800/40 text-red-300" },
    { id: "analytics", name: "Analytics", icon: "📈", bg: "bg-purple-950/60 border-purple-800/40 text-purple-300" },
    { id: "stripe", name: "Billing", icon: "💳", bg: "bg-indigo-950/60 border-indigo-800/40 text-indigo-300" },
    { id: "slack", name: "Slack", icon: "💬", bg: "bg-amber-950/60 border-amber-800/40 text-amber-300" },
    { id: "linear", name: "Linear", icon: "⚡", bg: "bg-slate-900 border-slate-700 text-slate-300" },
    { id: "new", name: "Build App", icon: "✨", bg: "bg-zinc-900 border-dashed border-zinc-700 text-zinc-400" },
  ];

  const triggerChat = (prompt: string) => {
    setSelectedPrompt(prompt);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    triggerChat(promptText);
    setPromptText("");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex overflow-hidden">
      <MascotDefs />

      {/* DUAL-RAIL SIDEBAR */}
      <Sidebar onOpenNewChat={() => triggerChat("Hi Hashira Agent, show me the workspace status.")} />

      {/* MAIN VIEWPORT */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* TOP MOBILE HEADER */}
        <header className="lg:hidden flex items-center justify-between px-5 h-14 border-b border-[var(--border)] shrink-0">
          <PlyxlLogo height={20} />
          <div className="flex items-center gap-2">
            <span className="squircle text-micro font-semibold px-2 py-0.5 bg-fill text-muted">20k</span>
            <button
              onClick={() => triggerChat("")}
              className="h-8 w-8 rounded-full bg-ink text-on-ink grid place-items-center"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
              </svg>
            </button>
          </div>
        </header>

        {/* HERO CONTAINER */}
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-12 max-w-4xl mx-auto w-full">
          {/* Greeting */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="font-display text-3xl sm:text-4xl text-text font-normal tracking-tight">
              Good morning, Arshin
            </h1>
            <p className="text-subhead text-muted max-w-md mx-auto leading-relaxed">
              Hashira Agent doesn’t know the business yet. Tell it what you need and it builds it.
            </p>
          </div>

          {/* THE AUTHENTIC PLYXL ASK INPUT */}
          <form onSubmit={handleFormSubmit} className="relative w-full max-w-2xl group">
            <div className="relative rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl transition-all duration-300 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
                rows={1}
                placeholder="Ask Hashira Agent"
                className="w-full min-h-[74px] py-5 pl-6 pr-36 resize-none bg-transparent text-text text-base placeholder:text-muted/60 focus:outline-none"
              />

              {/* ACTION TOOL ICONS ON THE RIGHT */}
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Ideas to try */}
                <button
                  type="button"
                  title="Ideas to try"
                  onClick={() => triggerChat("Suggest automated routines for my finance and sales workflows.")}
                  className="h-9 w-9 grid place-items-center rounded-full text-subtle hover:text-text hover:bg-fill transition"
                >
                  <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.81A87.92,87.92,0,1,1,216,104Z" />
                  </svg>
                </button>

                {/* Voice button */}
                <button
                  type="button"
                  title="Say it instead of typing"
                  onClick={() => alert("Voice input listening mode activated.")}
                  className="h-9 w-9 grid place-items-center rounded-full text-subtle hover:text-text hover:bg-fill transition"
                >
                  <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V240a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z" />
                  </svg>
                </button>

                {/* Attach File button */}
                <button
                  type="button"
                  title="Attach a file"
                  onClick={() => alert("Upload file for analysis.")}
                  className="h-9 w-9 grid place-items-center rounded-full text-subtle hover:text-text hover:bg-fill transition"
                >
                  <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                  </svg>
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!promptText.trim()}
                  aria-label="Send prompt"
                  className="h-9 w-9 grid place-items-center rounded-full bg-ink text-on-ink hover:bg-ink-hover disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" transform="rotate(90 128 128)" />
                  </svg>
                </button>
              </div>
            </div>
          </form>

          {/* QUICK SUGGESTION PILLS */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {quickPills.map((pill) => (
              <button
                key={pill.label}
                onClick={() => triggerChat(pill.prompt)}
                className="px-3.5 py-1.5 rounded-full bg-fill hover:bg-fill-strong border border-[var(--border)] text-xs text-muted hover:text-text transition-colors duration-150"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* 8-COLUMN APP SPRINGBOARD GRID */}
          <div className="w-full max-w-2xl mt-14 pt-8 border-t border-[var(--border)]">
            <div className="text-center text-micro uppercase tracking-wider text-muted font-medium mb-5">
              Hashira Operating System Apps
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {appTiles.map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => triggerChat(`Open and review ${tile.name} application state.`)}
                  className="flex flex-col items-center gap-2 group transition-transform active:scale-95"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl border transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg ${tile.bg}`}
                  >
                    {tile.icon}
                  </div>
                  <span className="text-micro text-muted group-hover:text-text transition-colors truncate max-w-[64px]">
                    {tile.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* SLIDE-OUT ASK DRAWER */}
      <AskDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialPrompt={selectedPrompt}
      />
    </div>
  );
}
