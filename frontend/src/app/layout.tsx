"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { CommandBar } from "@/components/agent/CommandBar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b14] text-slate-200 min-h-screen antialiased flex">
        {/* Sidebar Navigation */}
        <Sidebar onOpenCommandBar={() => setIsCommandBarOpen(true)} />

        {/* Dynamic Route Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>

        {/* Global Agent Command Bar (⌘J) */}
        <CommandBar
          isOpen={isCommandBarOpen}
          onClose={() => setIsCommandBarOpen(false)}
        />
      </body>
    </html>
  );
}
