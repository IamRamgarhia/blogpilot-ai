import type { AIProvider, ChatRequest, ChatResponse } from "../provider";

export interface OpenAICompatOptions {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  defaultModel: string;
  extraHeaders?: Record<string, string>;
}

export function openAICompatProvider(opt: OpenAICompatOptions): AIProvider {
  const p: AIProvider = {
    id: opt.id,
    name: opt.name,
    async chat(req: ChatRequest): Promise<ChatResponse> {
      const model = req.model ?? opt.defaultModel;
      const body: Record<string, unknown> = {
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 4096
      };
      if (req.jsonMode) body.response_format = { type: "json_object" };
      const headers: Record<string, string> = {
        "content-type": "application/json",
        ...(opt.extraHeaders ?? {})
      };
      if (opt.apiKey) headers["authorization"] = `Bearer ${opt.apiKey}`;
      const r = await fetch(`${opt.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(`${opt.id} ${r.status} ${await r.text()}`);
      const j = (await r.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const text = j.choices?.[0]?.message?.content ?? "";
      return {
        text,
        model,
        promptTokens: j.usage?.prompt_tokens ?? 0,
        completionTokens: j.usage?.completion_tokens ?? 0
      };
    },
    async test() {
      try {
        const r = await p.chat({ messages: [{ role: "user", content: "ping" }], maxTokens: 5 });
        return r.text.length > 0;
      } catch {
        return false;
      }
    }
  };
  return p;
}

// Preset factories for common OpenAI-compatible providers.

export const openAI = (apiKey: string) =>
  openAICompatProvider({ id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", apiKey, defaultModel: "gpt-4o-mini" });

export const groq = (apiKey: string) =>
  openAICompatProvider({ id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", apiKey, defaultModel: "llama-3.3-70b-versatile" });

export const together = (apiKey: string) =>
  openAICompatProvider({ id: "together", name: "Together AI", baseUrl: "https://api.together.xyz/v1", apiKey, defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo" });

export const mistral = (apiKey: string) =>
  openAICompatProvider({ id: "mistral", name: "Mistral", baseUrl: "https://api.mistral.ai/v1", apiKey, defaultModel: "mistral-small-latest" });

export const deepseek = (apiKey: string) =>
  openAICompatProvider({ id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", apiKey, defaultModel: "deepseek-chat" });

export const openrouter = (apiKey: string) =>
  openAICompatProvider({
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKey,
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    extraHeaders: {
      "HTTP-Referer": "https://github.com/dicecodes/blogpilot-ai",
      "X-Title": "BlogPilot AI"
    }
  });

export const cerebras = (apiKey: string) =>
  openAICompatProvider({ id: "cerebras", name: "Cerebras", baseUrl: "https://api.cerebras.ai/v1", apiKey, defaultModel: "llama-3.3-70b" });

export const perplexity = (apiKey: string) =>
  openAICompatProvider({ id: "perplexity", name: "Perplexity", baseUrl: "https://api.perplexity.ai", apiKey, defaultModel: "sonar" });

export const lmstudio = (baseUrl = "http://localhost:1234/v1") =>
  openAICompatProvider({ id: "lmstudio", name: "LM Studio", baseUrl, defaultModel: "local-model" });
