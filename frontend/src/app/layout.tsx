import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plyxl",
  description: "Autonomous AI Operating System for Business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--bg)] text-[var(--text)] min-h-screen antialiased selection:bg-white/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}
