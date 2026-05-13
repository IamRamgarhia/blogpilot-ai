"use client";
import { useState } from "react";

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini (free tier 1500/day)", envKey: "GEMINI_API_KEY", signup: "https://aistudio.google.com/app/apikey" },
  { id: "groq", name: "Groq (free, very fast)", envKey: "GROQ_API_KEY", signup: "https://console.groq.com/keys" },
  { id: "openrouter", name: "OpenRouter (free + paid models)", envKey: "OPENROUTER_API_KEY", signup: "https://openrouter.ai/keys" },
  { id: "anthropic", name: "Anthropic Claude (paid, premium)", envKey: "ANTHROPIC_API_KEY", signup: "https://console.anthropic.com/" },
  { id: "openai", name: "OpenAI (paid)", envKey: "OPENAI_API_KEY", signup: "https://platform.openai.com/api-keys" },
  { id: "deepseek", name: "DeepSeek (cheap premium)", envKey: "DEEPSEEK_API_KEY", signup: "https://platform.deepseek.com/" },
  { id: "mistral", name: "Mistral (free tier)", envKey: "MISTRAL_API_KEY", signup: "https://console.mistral.ai/" },
  { id: "cerebras", name: "Cerebras (free, ultra-fast)", envKey: "CEREBRAS_API_KEY", signup: "https://cloud.cerebras.ai/" },
  { id: "together", name: "Together AI", envKey: "TOGETHER_API_KEY", signup: "https://api.together.xyz/" },
  { id: "perplexity", name: "Perplexity (built-in web search)", envKey: "PERPLEXITY_API_KEY", signup: "https://www.perplexity.ai/settings/api" },
  { id: "lmstudio", name: "LM Studio (fully local)", envKey: "LMSTUDIO_BASE_URL", signup: "https://lmstudio.ai/" },
  { id: "ollama", name: "Ollama (fully local, no key)", envKey: "OLLAMA_BASE_URL", signup: "https://ollama.com/download" }
];

export default function SettingsPage() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function test(id: string) {
    setBusy(id);
    setResults((r) => ({ ...r, [id]: "testing…" }));
    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        body: JSON.stringify({ provider: id }),
        headers: { "content-type": "application/json" }
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      setResults((r) => ({ ...r, [id]: j.ok ? "✓ reachable" : `✗ ${j.error ?? "failed"}` }));
    } catch (e) {
      setResults((r) => ({ ...r, [id]: `✗ ${(e as Error).message}` }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">AI provider keys</h1>
        <p className="text-slate-400 text-sm max-w-2xl mt-2">
          Set provider keys in your{" "}
          <code className="text-slate-200 bg-slate-800 px-1 rounded">.env</code> file (or
          environment variables) and restart the dev server. Keys never leave your machine.
          BlogPilot will auto-failover between configured providers.
        </p>
      </header>

      <div className="grid gap-3">
        {PROVIDERS.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="text-white font-medium">{p.name}</div>
              <code className="text-xs text-slate-400">{p.envKey}=...</code>
              <a
                href={p.signup}
                target="_blank"
                rel="noreferrer noopener"
                className="ml-3 text-xs text-blue-400 hover:underline"
              >
                Get key
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 min-w-[6rem] text-right">
                {results[p.id] ?? ""}
              </span>
              <button
                onClick={() => test(p.id)}
                disabled={busy === p.id}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
              >
                Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
