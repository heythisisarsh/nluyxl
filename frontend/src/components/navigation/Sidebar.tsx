"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SheepIcon, PlyxlLogo } from "@/components/Mascot";
import OrgSwitcher from "@/components/navigation/OrgSwitcher";
import { useTenant } from "@/context/TenantContext";

interface SidebarProps {
  onOpenNewChat?: () => void;
}

export default function Sidebar({ onOpenNewChat }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { currentOrg } = useTenant();

  const creditsDisplay = currentOrg
    ? `${Math.round(currentOrg.credits_limit / 1000)}k`
    : "20k";

  const navItems = [
    {
      name: "Home",
      href: "/home",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 256 256">
          <path d="M216,120v96H152V152H104v64H40V120a8,8,0,0,1,2.34-5.66l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,216,120Z" opacity="0.2" />
          <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z" />
        </svg>
      ),
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: <SheepIcon size={18} />,
    },
    {
      name: "Chat",
      href: "#chat",
      action: onOpenNewChat,
      icon: (
        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 256 256">
          <path d="M224,128A96,96,0,0,1,79.93,211.11h0L42.54,223.58a8,8,0,0,1-10.12-10.12l12.47-37.39h0A96,96,0,1,1,224,128Z" opacity="0.2" />
          <path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z" />
        </svg>
      ),
    },
    {
      name: "Connections",
      href: "/connections",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 256 256">
          <path d="M184,88a40,40,0,0,0-39.2,32H111.2A40,40,0,1,0,72,168a40,40,0,0,0,39.2-32h33.6A40,40,0,1,0,184,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,184,152ZM72,152a24,24,0,1,1,24-24A24,24,0,0,1,72,152Z" />
        </svg>
      ),
    },
    {
      name: "Team & Billing",
      href: "/settings/team",
      icon: (
        <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 256 256">
          <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.74a8,8,0,0,1-11.07-2.33,79.83,79.83,0,0,0-52.55-36.83,8,8,0,1,1,3.48-15.62,95.81,95.81,0,0,1,62.47,43.71A8,8,0,0,1,250.14,206.74ZM172,152a44,44,0,1,0-44-44,8,8,0,0,1-16,0,60,60,0,1,1,60,60,8,8,0,0,1,0-16Z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={`sidebar shrink-0 h-screen select-none ${collapsed ? 'w-[56px]' : 'w-[250px]'}`} data-collapsed={collapsed}>
      <div className="sidebar-frame h-full">
        {/* SLIM EDGE RAIL */}
        <div className="sidebar-edge">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle menu"
            className="h-8 w-8 shrink-0 grid place-items-center rounded-md text-subtle hover:text-text hover:bg-fill transition-colors"
            title="Toggle menu ⌘B"
            type="button"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z" />
            </svg>
          </button>

          <Link href="/settings/team">
            <button
              aria-label={`${creditsDisplay} credits`}
              className="squircle grid h-6 min-w-8 place-items-center rounded-sm bg-fill px-1 text-micro tracking-normal font-semibold tabular text-muted hover:text-text hover:bg-fill-strong transition-colors mt-2"
              title={`${creditsDisplay} AI credits left`}
              type="button"
            >
              {creditsDisplay}
            </button>
          </Link>

          <div className="pt-3">
            <button
              onClick={onOpenNewChat}
              aria-label="New chat"
              className="h-8 w-8 grid place-items-center rounded-full bg-ink text-on-ink hover:bg-ink-hover shadow-ink transition-[background-color,transform] duration-200 ease-out-expo active:scale-[0.96]"
              title="New chat ⌘J"
              type="button"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 256 256">
                <path d="M232.49,55.51l-32-32a12,12,0,0,0-17,0l-96,96A12,12,0,0,0,84,128v32a12,12,0,0,0,12,12h32a12,12,0,0,0,8.49-3.51l96-96A12,12,0,0,0,232.49,55.51ZM192,49l15,15L196,75,181,60Zm-69,99H108V133l56-56,15,15Zm105-7.43V208a20,20,0,0,1-20,20H48a20,20,0,0,1-20-20V48A20,20,0,0,1,48,28h67.43a12,12,0,0,1,0,24H52V204H204V140.57a12,12,0,0,1,24,0Z" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col items-center gap-1 pt-3">
            {navItems.map((item) => {
              const active = pathname === item.href;
              if (item.action) {
                return (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className={`relative h-8 w-8 grid place-items-center rounded-md transition-colors duration-200 ease-out-expo ${
                      active ? "bg-fill text-text" : "text-muted hover:text-text hover:bg-fill"
                    }`}
                    title={item.name}
                  >
                    <span className="flex">{item.icon}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative h-8 w-8 grid place-items-center rounded-md transition-colors duration-200 ease-out-expo ${
                    active ? "bg-fill text-text" : "text-muted hover:text-text hover:bg-fill"
                  }`}
                  title={item.name}
                >
                  <span className="flex">{item.icon}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* EXPANDED PANEL */}
        {!collapsed && (
          <div className="sidebar-panel">
            {/* Header / Workspace Switcher */}
            <div className="flex items-center gap-1.5 px-4 pt-4 shrink-0">
              <PlyxlLogo height={20} />
              <div className="relative min-w-0 ml-1">
                <OrgSwitcher />
              </div>
            </div>

            {/* New Chat Primary Pill */}
            <div className="px-3 pt-4 shrink-0">
              <button
                onClick={onOpenNewChat}
                className="group w-full h-9 flex items-center gap-2.5 pl-3 pr-3 rounded-full bg-ink text-on-ink hover:bg-ink-hover shadow-ink text-small font-medium transition-[background-color,transform] duration-200 ease-out-expo active:scale-[0.99]"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M232.49,55.51l-32-32a12,12,0,0,0-17,0l-96,96A12,12,0,0,0,84,128v32a12,12,0,0,0,12,12h32a12,12,0,0,0,8.49-3.51l96-96A12,12,0,0,0,232.49,55.51ZM192,49l15,15L196,75,181,60Zm-69,99H108V133l56-56,15,15Zm105-7.43V208a20,20,0,0,1-20,20H48a20,20,0,0,1-20-20V48A20,20,0,0,1,48,28h67.43a12,12,0,0,1,0,24H52V204H204V140.57a12,12,0,0,1,24,0Z" />
                </svg>
                <span className="flex-1 text-left font-sans">New chat</span>
                <kbd className="font-sans text-[11px] opacity-60 tabular">⌘J</kbd>
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-px px-2.5 pt-4 shrink-0">
              {navItems.map((item) => {
                const active = pathname === item.href;
                if (item.action) {
                  return (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className={`flex items-center gap-2.5 h-[34px] rounded-md px-2.5 text-small text-left transition-colors duration-200 ease-out-expo ${
                        active ? "bg-fill text-text font-medium" : "text-muted hover:text-text hover:bg-fill"
                      }`}
                    >
                      <span className="shrink-0 flex">{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2.5 h-[34px] rounded-md px-2.5 text-small text-left transition-colors duration-200 ease-out-expo ${
                      active ? "bg-fill text-text font-medium" : "text-muted hover:text-text hover:bg-fill"
                    }`}
                  >
                    <span className="shrink-0 flex">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Profile Footer */}
            <div className="mt-auto p-3 border-t border-[var(--border)]">
              <Link href="/settings/team">
                <div className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-fill transition-colors cursor-pointer">
                  <div className="h-7 w-7 rounded-full bg-slate-800 text-xs font-semibold flex items-center justify-center text-text border border-white/10">
                    A
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-small font-medium text-text truncate">Arshin</div>
                    <div className="text-[11px] text-muted truncate">
                      {currentOrg?.name || "Hashira"} ({currentOrg?.plan_id || "free"})
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
