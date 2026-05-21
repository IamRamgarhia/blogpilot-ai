import Link from "next/link";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";

const HUBS = [
  {
    title: "Discover",
    accent: "blue",
    blurb: "Auto-crawl any client URL. Identity, sitemap, vitals, voice — under 60 seconds.",
    features: ["Auto-discovery crawler", "Brand voice trainer", "Style profile extraction"]
  },
  {
    title: "Research",
    accent: "lime",
    blurb: "Free Google Autocomplete + PAA + Bing SERP. Intent classification. Gap analysis.",
    features: ["Keyword research", "Content gap analyzer", "Competitor blog scanner", "PAA tree explorer"]
  },
  {
    title: "Plan",
    accent: "violet",
    blurb: "Cluster-aware calendar. Pillars before spokes. Niche-aware publish dates.",
    features: ["Content calendar generator", "Publishing scheduler", "What-to-write-next queue"]
  },
  {
    title: "Write",
    accent: "amber",
    blurb: "Methodology-driven writer. 31 versioned playbooks. Schema, meta, internal links auto-generated.",
    features: [
      "Outline + approval gate",
      "Full post writer",
      "Meta + JSON-LD schema",
      "Internal link assistant",
      "Image briefs",
      "Refresh existing posts"
    ]
  },
  {
    title: "Score",
    accent: "rose",
    blurb: "Surfer-style live editor. TF-IDF grading vs top-10 SERP. Zero AI cost.",
    features: ["Real-time content score", "Term coverage chips", "Over-optimization warnings", "Topic authority via Wikipedia"]
  },
  {
    title: "Distribute",
    accent: "emerald",
    blurb: "Social repurposes, newsletter excerpts, 7 CMS exports, public client portal.",
    features: ["X / LinkedIn / IG / Pinterest / WhatsApp", "Newsletter short + long", "WordPress XML, Ghost, Webflow, Hugo", "Client portal share link"]
  },
  {
    title: "Measure",
    accent: "cyan",
    blurb: "Free rank tracking. GSC + GA4 CSV import. Decay alerts. Hreflang. llms.txt.",
    features: ["Rank tracker (Bing + DDG)", "Content decay monitor", "Hreflang manager", "llms.txt generator"]
  }
];

const HEADLINE_TOOLS = [
  { title: "Content Score editor", desc: "Real-time grading vs top-10 SERP. Surfer killer.", replaces: "Surfer · $89/mo", icon: "🎯" },
  { title: "PAA Tree", desc: "Recursive People-Also-Ask explorer, 3 levels deep.", replaces: "AlsoAsked · $15/mo", icon: "🌳" },
  { title: "SERP Features", desc: "Detect snippet, PAA, shopping, map pack, video, image, news, knowledge panel.", replaces: "SEMrush · $139/mo", icon: "🔎" },
  { title: "Topic Authority", desc: "Wikipedia-anchored niche entity coverage score.", replaces: "MarketMuse · $149/mo", icon: "📊" }
];

const ACCENT_STYLES: Record<string, { border: string; text: string; glow: string; dot: string }> = {
  blue:    { border: "border-blue-500/30",    text: "text-blue-300",    glow: "shadow-blue-500/10",    dot: "bg-blue-400" },
  lime:    { border: "border-lime-500/30",    text: "text-lime-300",    glow: "shadow-lime-500/10",    dot: "bg-lime-400" },
  violet:  { border: "border-violet-500/30",  text: "text-violet-300",  glow: "shadow-violet-500/10",  dot: "bg-violet-400" },
  amber:   { border: "border-amber-500/30",   text: "text-amber-300",   glow: "shadow-amber-500/10",   dot: "bg-amber-400" },
  rose:    { border: "border-rose-500/30",    text: "text-rose-300",    glow: "shadow-rose-500/10",    dot: "bg-rose-400" },
  emerald: { border: "border-emerald-500/30", text: "text-emerald-300", glow: "shadow-emerald-500/10", dot: "bg-emerald-400" },
  cyan:    { border: "border-cyan-500/30",    text: "text-cyan-300",    glow: "shadow-cyan-500/10",    dot: "bg-cyan-400" }
};

export default async function HomePage() {
  await ensureMigrated();
  const db = getDb();
  const clients = await db.select().from(schema.clients).all();

  return (
    <section className="space-y-12">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-blue-950/30 p-8 lg:p-12">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-lime-500/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="inline-block px-3 py-1 text-xs uppercase tracking-wider rounded-full border border-lime-500/30 text-lime-300 bg-lime-500/5 mb-4">
            v1.0 · 38 modules · MIT licensed · built by Dice Codes
          </span>
          <h1 className="text-4xl lg:text-5xl font-semibold text-white max-w-3xl leading-tight">
            Your clients, your content,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-lime-400 bg-clip-text text-transparent">
              on autopilot.
            </span>
          </h1>
          <p className="text-slate-300 mt-4 max-w-2xl text-lg">
            Open-source SEO content studio with everything Surfer, Ahrefs, Clearscope, and MarketMuse charge $400+/mo for.
            Bring your own AI key — free Gemini works. Self-hostable. No subscriptions, ever.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/clients/new"
              className="px-5 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/20 transition"
            >
              + Add a client to start
            </Link>
            <Link
              href="/settings"
              className="px-5 py-3 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition"
            >
              Connect AI key
            </Link>
            <Link
              href="/about"
              className="px-5 py-3 rounded-xl text-slate-400 hover:text-white transition"
            >
              About →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
            <Stat number="39" label="Modules + tools" />
            <Stat number="45" label="Methodologies" />
            <Stat number="12+" label="AI providers" />
            <Stat number="$0" label="API cost*" />
          </div>
        </div>
      </div>

      {/* CLIENTS */}
      {clients.length > 0 ? (
        <div>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Your clients</h2>
            <span className="text-xs text-slate-500">{clients.length} total</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/clients/${c.id}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-blue-500/50 hover:bg-slate-900/60 transition"
              >
                <div className="text-white font-medium truncate group-hover:text-blue-300 transition">{c.name}</div>
                <div className="text-xs text-slate-500 truncate mt-1">{c.url}</div>
                <div className="text-xs text-slate-600 mt-3">
                  Added {new Date(c.createdAt * 1000).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
          <p className="text-sm text-slate-400">
            No clients yet. <Link href="/clients/new" className="text-blue-400 hover:underline">Add your first client</Link> — auto-discovery runs in under 60 seconds.
          </p>
        </div>
      )}

      {/* HEADLINE TOOLS */}
      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">Headline tools</h2>
            <p className="text-sm text-slate-400 mt-1">The four screenshots that replace ~$400/mo of premium subscriptions.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HEADLINE_TOOLS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/30 p-5 hover:border-slate-700 hover:bg-slate-900/60 transition">
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="text-white font-medium">{t.title}</div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{t.desc}</p>
              <div className="mt-3 text-[10px] uppercase tracking-wider text-lime-400 bg-lime-500/10 rounded-full px-2 py-0.5 inline-block">
                replaces {t.replaces}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HUB GRID */}
      <div>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-white">7 hubs · 38 modules</h2>
            <p className="text-sm text-slate-400 mt-1">Every workflow from blank page to first-page rank.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {HUBS.map((h) => {
            const styles = ACCENT_STYLES[h.accent];
            return (
              <div
                key={h.title}
                className={`rounded-2xl border ${styles.border} bg-slate-900/40 p-5 shadow-lg ${styles.glow} hover:bg-slate-900/60 transition`}
              >
                <div className={`text-xs uppercase tracking-wider ${styles.text} mb-2 font-semibold`}>{h.title}</div>
                <p className="text-sm text-slate-200 leading-relaxed">{h.blurb}</p>
                <ul className="mt-4 space-y-1.5">
                  {h.features.map((f) => (
                    <li key={f} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className={`mt-1.5 w-1 h-1 rounded-full ${styles.dot} shrink-0`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK START */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/60 to-slate-900/20 p-6 lg:p-8">
        <h2 className="text-xl font-semibold text-white">Start in 60 seconds</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-5">
          <Step n="1" title="Add a client" body="Paste any URL. Auto-discovery pulls identity, sitemap, vitals, and competitors in 30-60 seconds." link={{ href: "/clients/new", label: "Add client →" }} />
          <Step n="2" title="(Optional) connect AI" body="Free Gemini = 1,500 requests/day. Without a key, deterministic fallback paths still work." link={{ href: "/settings", label: "Settings →" }} />
          <Step n="3" title="Research, write, ship" body="Keyword research → calendar → outline → draft → score → distribute. All free." link={null} />
        </div>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-xs text-slate-600 text-center max-w-3xl mx-auto leading-relaxed">
        * No paid third-party APIs required. Free public endpoints used: Bing SERP, Google Autocomplete, PageSpeed Insights v5, Wikipedia, OpenStreetMap. Your AI key is the only configuration needed — and free tiers are enough for most users.
      </p>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-white">{number}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function Step({ n, title, body, link }: { n: string; title: string; body: string; link: { href: string; label: string } | null }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono flex items-center justify-center">{n}</span>
        <span className="text-white font-medium text-sm">{title}</span>
      </div>
      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{body}</p>
      {link && (
        <Link href={link.href} className="text-xs text-blue-400 hover:underline mt-3 inline-block">
          {link.label}
        </Link>
      )}
    </div>
  );
}
