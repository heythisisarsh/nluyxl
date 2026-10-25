"use client";

import React, { useState } from "react";

export default function AgendaWidget({ onScheduleNew }: { onScheduleNew?: () => void }) {
  const [events, setEvents] = useState([
    {
      id: "ev_1",
      title: "Executive Sprint Review & KPI Sync",
      time: "10:00 AM - 10:45 AM",
      attendees: 5,
      type: "internal",
    },
    {
      id: "ev_2",
      title: "Commercial Contract Discussion: Harbourview",
      time: "02:00 PM - 02:30 PM",
      attendees: 3,
      type: "client",
    },
    {
      id: "ev_3",
      title: "Audit & Security Review with DevOps",
      time: "04:30 PM - 05:00 PM",
      attendees: 2,
      type: "ops",
    },
  ]);

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          <h3 className="text-small font-semibold text-text">Today's Agenda & Meetings</h3>
        </div>
        <button
          onClick={onScheduleNew}
          className="text-micro text-indigo-400 hover:text-indigo-300 font-medium transition"
        >
          + Schedule
        </button>
      </div>

      <div className="space-y-2.5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between gap-3 hover:border-white/10 transition"
          >
            <div className="min-w-0">
              <div className="text-small font-medium text-text truncate">{ev.title}</div>
              <div className="text-micro text-muted font-mono mt-0.5">{ev.time}</div>
            </div>

            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono shrink-0 ${
                ev.type === "client"
                  ? "bg-purple-950 text-purple-300 border border-purple-800"
                  : "bg-blue-950 text-blue-300 border border-blue-800"
              }`}
            >
              {ev.attendees} People
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
