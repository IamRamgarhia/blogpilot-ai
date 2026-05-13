import type { AIProvider, ChatRequest, ChatResponse } from "../provider";

export function anthropicProvider(apiKey: string, defaultModel = "claude-haiku-4-5-20251001"): AIProvider {
  const p: AIProvider = {
    id: "anthropic",
    name: "Anthropic Claude",
    async chat(req: ChatRequest): Promise<ChatResponse> {
      const model = req.model ?? defaultModel;
      const system = req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
      const messages = req.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));
      const body: Record<string, unknown> = {
        model,
        system,
        messages,
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature ?? 0.7
      };
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(`anthropic ${r.status} ${await r.text()}`);
      const j = (await r.json()) as {
        content?: Array<{ text?: string }>;
        usage?: { input_tokens?: number; output_tokens?: number };
      };
      const text = j.content?.map((c) => c.text ?? "").join("") ?? "";
      return {
        text,
        model,
        promptTokens: j.usage?.input_tokens ?? 0,
        completionTokens: j.usage?.output_tokens ?? 0
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
