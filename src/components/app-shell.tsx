import Link from "next/link";
import Image from "next/image";
import { DiceCodesBadge } from "./dice-codes-badge";
import { DiceCodesRail } from "./dice-codes-rail";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/blogpilot-logo.svg" alt="BlogPilot AI" width={28} height={28} />
            <span className="font-semibold text-white">
              BlogPilot <span className="text-blue-400">AI</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">
              Clients
            </Link>
            <Link href="/settings" className="hover:text-white">
              Settings
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <DiceCodesBadge />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>

      <footer className="border-t border-slate-800 py-4 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            BlogPilot AI · MIT licensed · Built by{" "}
            <a href="https://dicecodes.com" className="text-slate-300 hover:text-white">
              Dice Codes
            </a>
          </span>
          <span>
            Free consult:{" "}
            <a href="https://wa.me/919888404991" className="hover:text-white">
              WhatsApp 9888404991
            </a>{" "}
            · Contact@dicecodes.com
          </span>
        </div>
      </footer>

      <DiceCodesRail />
    </div>
  );
}
