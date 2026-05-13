"use client";
import { useState } from "react";

export function DiceCodesRail() {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed right-3 bottom-3 text-xs px-3 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-lg z-40"
      >
        Need a custom SaaS?
      </button>
    );
  }
  return (
    <aside className="fixed right-4 bottom-4 w-72 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur p-4 shadow-2xl z-40">
      <button
        onClick={() => setOpen(false)}
        className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 text-xs"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <h3 className="text-sm font-semibold text-white mb-1">Need a custom SaaS like this?</h3>
      <p className="text-xs text-slate-400 mb-3">
        Dice Codes builds web apps, SaaS, mobile apps and SEO-ready sites at startup-friendly prices.
      </p>
      <div className="flex gap-2">
        <a
          href="https://wa.me/919888404991"
          target="_blank"
          rel="noreferrer noopener"
          className="flex-1 text-center text-xs py-2 rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400"
        >
          WhatsApp
        </a>
        <a
          href="mailto:Contact@dicecodes.com"
          className="flex-1 text-center text-xs py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400"
        >
          Email
        </a>
      </div>
    </aside>
  );
}
