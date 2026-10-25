"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Briefcase, 
  MessageSquare, 
  Mail, 
  Calendar, 
  Grid, 
  Layers, 
  Settings, 
  Coins, 
  Command,
  HelpCircle
} from "lucide-react";

interface SidebarProps {
  onOpenCommandBar: () => void;
}

export function Sidebar({ onOpenCommandBar }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Mail", href: "/mail", icon: Mail },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Connections", href: "/connections", icon: Layers },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-56 bg-[#0a0e1a] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="space-y-4">
        {/* Workspace Switcher */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              H
            </div>
            <span className="font-semibold text-xs text-white tracking-tight">Hashira</span>
          </div>
          <span className="text-[10px] text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/50">Free</span>
        </div>

        {/* Global Agent Command Trigger */}
        <button
          onClick={onOpenCommandBar}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Ask @Plyxl</span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-indigo-700/80 rounded text-[10px] font-mono flex items-center">
            <Command className="h-2.5 w-2.5 mr-0.5" /> J
          </kbd>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Credit Quota & User Profile */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <div className="flex items-center space-x-1">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-medium">Credits</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">20,000 left</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[2%]"></div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center space-x-2 truncate">
            <div className="h-7 w-7 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-xs">
              A
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-white truncate">Arshin albab</div>
              <div className="text-[10px] text-slate-500 truncate">Owner</div>
            </div>
          </div>
          <HelpCircle className="h-4 w-4 text-slate-500 hover:text-slate-300 cursor-pointer" />
        </div>
      </div>
    </aside>
  );
}
