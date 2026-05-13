import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "BlogPilot AI — Your autopilot from blank page to first-page rank",
  description:
    "Open-source AI-powered SEO content studio for bloggers and agencies. Auto-discovers any client site, plans content, writes posts, schedules publishing. Built by Dice Codes."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
