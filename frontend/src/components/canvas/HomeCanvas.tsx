"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash/debounce";
import { 
  Inbox, 
  Calendar as CalendarIcon, 
  Bolt, 
  Plus, 
  GripVertical, 
  MoreHorizontal, 
  ExternalLink,
  RotateCcw
} from "lucide-react";

interface GridUnit {
  id: string;
  unit_id: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function HomeCanvas() {
  const [units, setUnits] = useState<GridUnit[]>([
    { id: "grid_1", unit_id: "unit_mailbox", title: "Priority Mailbox", x: 0, y: 0, w: 4, h: 2 },
    { id: "grid_2", unit_id: "unit_calendar", title: "Today's Agenda", x: 4, y: 0, w: 4, h: 2 },
    { id: "grid_3", unit_id: "unit_automation_invoicing", title: "Active Job: Invoicing", x: 8, y: 0, w: 4, h: 2 }
  ]);

  const pendingSyncRef = useRef<GridUnit[] | null>(null);

  // 1. Debounced persistence (500ms) to PUT /api/home/grid
  const persistGridToServer = useCallback(
    debounce(async (updated: GridUnit[]) => {
      try {
        await fetch("http://localhost:8000/api/home/grid", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grid: updated }),
        });
        pendingSyncRef.current = null;
      } catch (err) {
        console.error("Failed to persist grid layout:", err);
      }
    }, 500),
    []
  );

  // 2. Unload beacon listener (keepalive: true)
  useEffect(() => {
    const handlePageHide = () => {
      if (pendingSyncRef.current) {
        fetch("http://localhost:8000/api/home/grid", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grid: pendingSyncRef.current }),
          keepalive: true,
        });
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  const handleReset = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/home/grid", { method: "DELETE" });
      const data = await res.json();
      if (data.grid) setUnits(data.grid);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-8 min-h-screen bg-slate-950 text-white overflow-y-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Good morning, Arshin</h1>
          <p className="text-xs text-slate-400 mt-1">Here is the active operational status across your business.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Layout</span>
          </button>
          <button
            onClick={() => alert("Say what you want to see, and the agent builds it.")}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Make a widget</span>
          </button>
        </div>
      </div>

      {/* 12-Column Responsive Canvas Grid */}
      <div className="grid grid-cols-12 gap-5 auto-rows-[160px]">
        {/* UNIT 1: PRIORITY MAILBOX */}
        <div className="col-span-12 md:col-span-4 row-span-2 p-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <div className="flex items-center space-x-2 font-semibold text-slate-200">
                <Inbox className="h-4 w-4 text-indigo-400" />
                <span>Priority Mailbox</span>
              </div>
              <GripVertical className="h-4 w-4 text-slate-600 cursor-grab" />
            </div>
            <div className="space-y-3">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                  <span>David at Harbourview</span>
                  <span className="text-[10px] text-indigo-400">Draft ready</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">"Can your team quote on HVAC maintenance for Bldg 4?"</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                  <span>Elena at Cedar Park</span>
                  <span className="text-[10px] text-amber-400">Pending reply</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">"Please confirm if Dev or Sam can come this Thursday."</p>
              </div>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-indigo-400 font-medium cursor-pointer flex items-center justify-between">
            <span>Open Mailbox (2 drafts ready)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* UNIT 2: TODAY'S AGENDA */}
        <div className="col-span-12 md:col-span-4 row-span-2 p-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <div className="flex items-center space-x-2 font-semibold text-slate-200">
                <CalendarIcon className="h-4 w-4 text-emerald-400" />
                <span>Today's Calendar</span>
              </div>
              <GripVertical className="h-4 w-4 text-slate-600 cursor-grab" />
            </div>
            <div className="space-y-2">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-medium text-slate-200">Cedar Park Site Review</div>
                  <div className="text-[10px] text-slate-500">Tech: Dev • HVAC Assessment</div>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">11:00 AM</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-medium text-slate-200">Quote Dispatch Review</div>
                  <div className="text-[10px] text-slate-500">Office / Zoom</div>
                </div>
                <span className="text-emerald-400 font-mono text-[11px]">2:30 PM</span>
              </div>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Nothing else on calendar today</span>
            <span className="text-emerald-400 font-medium cursor-pointer">Book new slot</span>
          </div>
        </div>

        {/* UNIT 3: ACTIVE AUTOMATION */}
        <div className="col-span-12 md:col-span-4 row-span-2 p-5 bg-slate-900/90 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <div className="flex items-center space-x-2 font-semibold text-slate-200">
                <Bolt className="h-4 w-4 text-amber-400" />
                <span>Active Automation</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Approval Needed
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200">Weekly Overdue Invoicing</div>
              <p className="text-[11px] text-slate-400 mt-1">Found 3 overdue invoices (>14d). Ready to email payment reminders.</p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => alert("Invoicing follow-ups approved and sent via Gmail API.")}
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                >
                  Approve (3)
                </button>
                <button
                  onClick={() => alert("Preview details modal opened.")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-slate-500">
            Next scheduled run: Monday at 8:00 AM
          </div>
        </div>
      </div>
    </div>
  );
}
