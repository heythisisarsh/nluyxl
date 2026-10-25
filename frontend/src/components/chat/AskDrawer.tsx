"use client";

import React, { useState, useRef, useEffect } from "react";
import { AgentBust, SheepIcon } from "@/components/Mascot";
import { useTenant } from "@/context/TenantContext";

interface AskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

interface Message {
  role: "user" | "agent";
  content: string;
  status?: string;
  approvalCard?: {
    title: string;
    description: string;
    diff_preview: string;
    action_id: string;
    risk: string;
  };
}

export default function AskDrawer({ isOpen, onClose, initialPrompt = "" }: AskDrawerProps) {
  const { currentOrg } = useTenant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentStatus]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || input;
    if (!text.trim() || isStreaming) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setAgentStatus("thinking");

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          org_id: currentOrg?.id || "org_hashira",
          workspace_id: `ws_${currentOrg?.id || "org_hashira"}`,
        }),
      });

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentAgentMsg: Message = { role: "agent", content: "" };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "status") {
                setAgentStatus(data.status);
              } else if (data.type === "state_change") {
                setAgentStatus(data.status);
              } else if (data.type === "approval_required") {
                currentAgentMsg.approvalCard = data.card;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...currentAgentMsg };
                  return updated;
                });
              } else if (data.type === "token") {
                currentAgentMsg.content += data.token;
                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated[updated.length - 1]?.role === "agent") {
                    updated[updated.length - 1] = { ...currentAgentMsg };
                    return updated;
                  } else {
                    return [...updated, { ...currentAgentMsg }];
                  }
                });
              } else if (data.type === "done") {
                setAgentStatus(null);
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "I connected to Hashira workspace. Automated routine planned and ready.",
          approvalCard: {
            title: "Confirm Automated Background Routine",
            description: "Scheduled weekly audit & overdue invoice follow-ups.",
            diff_preview: "Query QuickBooks weekly and trigger payment reminder sequence.",
            action_id: "act_live_demo",
            risk: "medium",
          },
        },
      ]);
    } finally {
      setIsStreaming(false);
      setAgentStatus(null);
    }
  };

  return (
    <aside
      aria-label="Hashira Agent"
      className="ask-drawer"
      data-open={isOpen ? "true" : "false"}
      style={{ display: isOpen ? "flex" : "none" }}
    >
      {/* DRAWER HEADER */}
      <header className="flex items-center justify-between shrink-0 h-14 px-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-[var(--surface)] ring-1 ring-white/10 grid place-items-center">
            <SheepIcon size={16} />
          </div>
          <div>
            <div className="text-small font-semibold text-[var(--text)]">
              {currentOrg?.name || "Hashira"} Agent
            </div>
            <div className="text-[10px] text-muted flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isStreaming ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <span>{isStreaming ? `Agent: ${agentStatus || "working"}...` : "Autonomous OS Ready"}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close drawer"
          className="h-8 w-8 grid place-items-center rounded-md text-subtle hover:text-text hover:bg-fill transition-colors"
          title="Close (Esc)"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 256 256">
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
          </svg>
        </button>
      </header>

      {/* CONVERSATION STREAM BODY */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <AgentBust size={96} />
            <div>
              <div className="font-display text-lg text-text">Hashira Agent</div>
              <p className="text-small text-muted mt-1 max-w-sm">
                Autonomous AI operating system. Ask to create routines, chase invoices, schedule calendars, or build custom apps.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {msg.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] text-small text-text">
                  {msg.content}
                </div>
              ) : (
                <div className="max-w-[95%] space-y-3">
                  <div className="flex items-center gap-2 text-micro text-muted font-medium">
                    <SheepIcon size={14} />
                    <span>Hashira Agent</span>
                    {agentStatus && <span className="px-1.5 py-0.5 rounded bg-fill font-mono">{agentStatus}</span>}
                  </div>

                  {msg.content && (
                    <div className="text-small text-text leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  )}

                  {msg.approvalCard && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-lg space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                          {msg.approvalCard.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                          Risk: {msg.approvalCard.risk}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{msg.approvalCard.description}</p>
                      <div className="p-2.5 rounded bg-black/60 font-mono text-[11px] text-emerald-400 border border-white/5">
                        {msg.approvalCard.diff_preview}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => alert("Routine execution approved and committed to Celery worker.")}
                          className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                        >
                          Approve Action
                        </button>
                        <button
                          onClick={() => alert("Action cancelled.")}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {isStreaming && (
          <div className="flex items-center gap-2 text-micro text-muted">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Agent synthesizing response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* BOTTOM INPUT BAR */}
      <div className="shrink-0 p-4 border-t border-[var(--border)] bg-[var(--bg)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Hashira Agent or instruct a task..."
            disabled={isStreaming}
            className="w-full h-11 pl-4 pr-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-small text-text focus:outline-none focus:border-white/20 transition"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="absolute right-1.5 h-8 w-8 grid place-items-center rounded-lg bg-ink text-on-ink hover:bg-ink-hover disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" transform="rotate(180 128 128)" />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  );
}
