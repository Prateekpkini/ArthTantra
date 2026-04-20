import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArthTantra — Autonomous Financial Digital Twin",
  description:
    "AI-powered autonomous financial agent. Multi-agent cognitive engine with real-time streaming reasoning, 3D portfolio visualization, and autonomous execution.",
  keywords: [
    "AI Finance",
    "Digital Twin",
    "Autonomous Agent",
    "Portfolio Management",
    "Financial AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
