"use client";
import { useState, use } from "react";
import Link from "next/link";

interface PaaNode { question: string; depth: number; children: PaaNode[]; }
interface Authority {
  niche: string;
  score: number;
  tier: string;
  wikipedia_anchor: string | null;
  total_entities: number;
  covered: Array<{ entity: string; post_count: number }>;
  missing: Array<{ entity: string; suggested_post_title: string }>;
  recommended_action: string;
}
interface Features {
  keyword: string;
  features: string[];
  total_results_indicator: string | null;
  notes: string[];
}

const FEATURE_LABELS: Record<string, { name: string; emoji: string; description: string }> = {
  featured_snippet: { name: "Featured snippet", emoji: "📌", description: "Direct-answer paragraph or list" },
  paa: { name: "People also ask", emoji: "❓", description: "Expandable Q&A box" },
  shopping: { name: "Shopping", emoji: "🛒", description: "Product carousel" },
  map_pack: { name: "Map pack", emoji: "📍", description: "Local 3-pack" },
  video_carousel: { name: "Video carousel", emoji: "🎬", description: "Top videos row" },
  image_pack: { name: "Image pack", emoji: "🖼️", description: "Image carousel" },
  knowledge_panel: { name: "Knowledge panel", emoji: "📚", description: "Entity / brand card" },
  top_stories: { name: "Top stories", emoji: "📰", description: "Recent news" },
  twitter_box: { name: "X / Twitter", emoji: "💬", description: "Social embed" }
};

export default function ToolsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<"paa" | "features" | "authority">("paa");

  // PAA
  const [paaSeed, setPaaSeed] = useState("");
  const [paaTree, setPaaTree] = useState<PaaNode | null>(null);
  const [paaBusy, setPaaBusy] = useState(false);

  // Features
  const [fkw, setFkw] = useState("");
  const [features, setFeatures] = useState<Features | null>(null);
  const [fBusy, setFBusy] = useState(false);

  // Topic authority
  const [niche, setNiche] = useState("");
  const [authority, setAuthority] = useState<Authority | null>(null);
  const [aBusy, setABusy] = useState(false);

  async function runPaa() {
    setPaaBusy(true);
    setPaaTree(null);
    try {
      const r = await fetch("/api/paa-tree", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seed: paaSeed, maxDepth: 3 })
      });
      const j = await r.json();
      setPaaTree(j.tree ?? null);
    } finally {
      setPaaBusy(false);
    }
  }

  async function runFeatures() {
    setFBusy(true);
    setFeatures(null);
    try {
      const r = await fetch("/api/serp-features", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword: fkw })
      });
      setFeatures(await r.json());
    } finally {
      setFBusy(false);
    }
  }

  async function runAuthority() {
    setABusy(true);
    setAuthority(null);
    try {
      const r = await fetch("/api/topic-authority", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientId: id, niche })
      });
      setAuthority(await r.json());
    } finally {
      setABusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
          ← Client
        </Link>
        <h1 className="text-2xl font-semibold text-white mt-1">SEO tools</h1>
        <p className="text-slate-400 text-sm mt-1">
          Free-API tools that replace AlsoAsked, SEMrush SERP feature checker, and MarketMuse topic modeling.
        </p>
      </header>

      <div className="flex gap-2 border-b border-slate-800">
        {(["paa", "features", "authority"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px " +
              (tab === t
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200")
            }
          >
            {t === "paa" ? "PAA tree" : t === "features" ? "SERP features" : "Topic authority"}
          </button>
        ))}
      </div>

      {tab === "paa" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={paaSeed}
              onChange={(e) => setPaaSeed(e.target.value)}
              placeholder="seed question or keyword"
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:border-blue-500 outline-none transition"
            />
            <button
              onClick={runPaa}
              disabled={paaBusy || !paaSeed}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition"
            >
              {paaBusy ? "Building tree…" : "Build tree"}
            </button>
          </div>
          {paaTree && <PaaTreeView node={paaTree} />}
        </div>
      )}

      {tab === "features" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={fkw}
              onChange={(e) => setFkw(e.target.value)}
              placeholder="target keyword"
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:border-blue-500 outline-none"
            />
            <button
              onClick={runFeatures}
              disabled={fBusy || !fkw}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition"
            >
              {fBusy ? "Detecting…" : "Detect features"}
            </button>
          </div>
          {features && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(FEATURE_LABELS).map(([key, meta]) => {
                const present = features.features.includes(key);
                return (
                  <div
                    key={key}
                    className={
                      "rounded-2xl border p-4 transition " +
                      (present
                        ? "border-lime-500/40 bg-lime-500/5"
                        : "border-slate-800 bg-slate-900/40 opacity-60")
                    }
                  >
                    <div className="text-2xl mb-2">{meta.emoji}</div>
                    <div className="text-white font-medium text-sm">{meta.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{meta.description}</div>
                    <div className={"text-[10px] mt-2 " + (present ? "text-lime-400" : "text-slate-600")}>
                      {present ? "PRESENT — target this" : "not detected"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "authority" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="niche or seed topic (e.g. wordpress seo)"
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white focus:border-blue-500 outline-none"
            />
            <button
              onClick={runAuthority}
              disabled={aBusy || !niche}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition"
            >
              {aBusy ? "Scoring…" : "Score authority"}
            </button>
          </div>
          {authority && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Authority score</div>
                  <div className={"text-5xl font-bold mt-1 " + tierColor(authority.tier)}>{authority.score}</div>
                  <div className="text-slate-400 mt-1 text-sm capitalize">{authority.tier}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{authority.total_entities} canonical entities</div>
                  <div className="text-xs text-slate-500 mt-0.5">{authority.covered.length} covered · {authority.missing.length} missing</div>
                  {authority.wikipedia_anchor && (
                    <a href={authority.wikipedia_anchor} target="_blank" rel="noreferrer noopener" className="text-xs text-blue-400 hover:underline mt-2 block">
                      Wikipedia anchor →
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-300">{authority.recommended_action}</p>

              {authority.missing.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Missing entities · suggested posts</h3>
                  <ul className="space-y-1.5">
                    {authority.missing.map((m, i) => (
                      <li key={i} className="text-sm flex justify-between gap-3">
                        <span className="text-white">{m.suggested_post_title}</span>
                        <span className="text-slate-500 text-xs">{m.entity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {authority.covered.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Covered entities</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {authority.covered.map((c) => (
                      <span key={c.entity} className="text-xs px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30">
                        {c.entity}
                        <span className="opacity-60 ml-1 text-[10px]">×{c.post_count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PaaTreeView({ node }: { node: PaaNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <PaaTreeNode node={node} />
    </div>
  );
}

function PaaTreeNode({ node }: { node: PaaNode }) {
  const padding = node.depth * 16;
  return (
    <div>
      <div className="flex items-center gap-2 py-1" style={{ paddingLeft: padding }}>
        <span className={node.depth === 0 ? "text-white font-medium" : "text-slate-300"}>
          {node.depth > 0 && "↳ "}
          {node.question}
        </span>
        {node.children.length > 0 && (
          <span className="text-[10px] text-slate-500">({node.children.length})</span>
        )}
      </div>
      {node.children.map((c, i) => <PaaTreeNode key={i} node={c} />)}
    </div>
  );
}

function tierColor(t: string): string {
  if (t === "strong") return "text-lime-400";
  if (t === "moderate") return "text-yellow-400";
  if (t === "surface") return "text-orange-400";
  return "text-slate-400";
}
