import type { AIProvider } from "./provider";
import { geminiProvider } from "./providers/gemini";
import { anthropicProvider } from "./providers/anthropic";
import {
  openAI,
  groq,
  together,
  mistral,
  deepseek,
  openrouter,
  cerebras,
  perplexity,
  lmstudio
} from "./providers/openai-compat";
import { ollamaProvider } from "./providers/ollama";

export interface ProviderEntry {
  provider: AIProvider;
  priority: number;
  enabled: boolean;
}

type EnvLike = Record<string, string | undefined>;

export function buildRegistry(env: EnvLike): ProviderEntry[] {
  const out: ProviderEntry[] = [];
  const add = (p: AIProvider, prio: number) =>
    out.push({ provider: p, priority: prio, enabled: true });

  if (env.ANTHROPIC_API_KEY) add(anthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL), 5);
  if (env.GEMINI_API_KEY) add(geminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL), 10);
  if (env.OPENAI_API_KEY) add(openAI(env.OPENAI_API_KEY), 15);
  if (env.GROQ_API_KEY) add(groq(env.GROQ_API_KEY), 20);
  if (env.DEEPSEEK_API_KEY) add(deepseek(env.DEEPSEEK_API_KEY), 25);
  if (env.OPENROUTER_API_KEY) add(openrouter(env.OPENROUTER_API_KEY), 30);
  if (env.TOGETHER_API_KEY) add(together(env.TOGETHER_API_KEY), 35);
  if (env.MISTRAL_API_KEY) add(mistral(env.MISTRAL_API_KEY), 40);
  if (env.CEREBRAS_API_KEY) add(cerebras(env.CEREBRAS_API_KEY), 45);
  if (env.PERPLEXITY_API_KEY) add(perplexity(env.PERPLEXITY_API_KEY), 50);
  if (env.LMSTUDIO_BASE_URL) add(lmstudio(env.LMSTUDIO_BASE_URL), 60);
  if (env.OLLAMA_BASE_URL || env.OLLAMA_ENABLED === "1")
    add(ollamaProvider(env.OLLAMA_BASE_URL), 90);

  return out.sort((a, b) => a.priority - b.priority);
}

export function chainFor(registry: ProviderEntry[]): AIProvider[] {
  return registry.filter((e) => e.enabled).map((e) => e.provider);
}
