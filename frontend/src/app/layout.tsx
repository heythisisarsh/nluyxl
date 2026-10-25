import type { Metadata } from "next";
import "./globals.css";
import { TenantProvider } from "@/context/TenantContext";

export const metadata: Metadata = {
  title: "Plyxl - Multi-Tenant Autonomous Workspace",
  description: "Autonomous AI Operating System with Database-per-Tenant Architecture",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--bg)] text-[var(--text)] min-h-screen antialiased selection:bg-white/20 selection:text-white">
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
