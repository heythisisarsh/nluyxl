"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Command, 
  Send, 
  Sparkles, 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Calendar,
  Layers
} from "lucide-react";
import { ApprovalCard } from "./ApprovalCard";

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "agent";
  content: string;
  status?: string;
  toolResult?: any;
  approvalCard?: any;
}

export function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeState, setActiveState] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle hotkey (⌘J / Ctrl+J and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        isOpen ? onClose() : null;
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: prompt };
    const initialAgentMessage: Message = { role: "agent", content: "", status: "thinking" };

    setMessages((prev) => [...prev, userMessage, initialAgentMessage]);
    const currentPrompt = prompt;
    setPrompt("");
    setIsStreaming(true);
    setActiveState("thinking");

    try {
      const response = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentPrompt, workspace_id: "b92a258f" }),
      });

      if (!response.body) throw new Error("No response body from stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let agentAccumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", "").trim());

              if (data.type === "state_change") {
                setActiveState(data.status);
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "agent") {
                    last.status = data.status;
                    last.toolResult = data.tool_result;
                  }
                  return updated;
                });
              } else if (data.type === "approval_required") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "agent") {
                    last.approvalCard = data.card;
                    last.status = "waiting";
                  }
                  return updated;
                });
              } else if (data.type === "token") {
                agentAccumulated += data.token;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "agent") {
                    last.content = agentAccumulated;
                  }
                  return updated;
                });
              }
            } catch (err) {
              // Ignore non-json chunks
            }
          }
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Error communicating with agent backend." },
      ]);
    } finally {
      setIsStreaming(false);
      setActiveState(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>@Plyxl Autonomous Assistant</span>
            {activeState && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/80 text-indigo-300 font-mono text-[10px]">
                {activeState}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Command className="h-8 w-8 mx-auto mb-2 text-slate-600" />
              <p className="font-medium text-slate-400">Ask for anything across your business</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setPrompt("Every Monday at 8 chase overdue invoices")}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-slate-200"
                >
                  "Every Monday at 8 chase overdue invoices"
                </button>
                <button
                  onClick={() => setPrompt("Can someone get to Harbourview first thing tomorrow?")}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-slate-200"
                >
                  "Can someone get to Harbourview tomorrow?"
                </button>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white font-medium"
                      : "bg-slate-900 border border-slate-800 text-slate-200"
                  }`}
                >
                  {m.status && m.status !== "done" && !m.content && (
                    <div className="flex items-center space-x-2 text-indigo-400 font-mono text-[11px]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>State: {m.status}...</span>
                    </div>
                  )}
                  {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                </div>

                {/* HITL Card rendering */}
                {m.approvalCard && (
                  <div className="w-full max-w-[85%]">
                    <ApprovalCard
                      card={m.approvalCard}
                      onApprove={(id) => alert(`Approved action ${id}`)}
                      onCancel={(id) => alert(`Cancelled action ${id}`)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask @Plyxl to schedule, message, or build a widget..."
            disabled={isStreaming}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={isStreaming || !prompt.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
