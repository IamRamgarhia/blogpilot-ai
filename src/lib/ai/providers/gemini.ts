import type { AIProvider, ChatRequest, ChatResponse } from "../provider";

export function geminiProvider(apiKey: string, defaultModel = "gemini-2.5-flash"): AIProvider {
  const base = "https://generativelanguage.googleapis.com/v1beta";
  const p: AIProvider = {
    id: "gemini",
    name: "Google Gemini",
    async chat(req: ChatRequest): Promise<ChatResponse> {
      const model = req.model ?? defaultModel;
      const sys = req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
      const contents = req.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const generationConfig: Record<string, unknown> = {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens ?? 4096
      };
      if (req.jsonMode) generationConfig.responseMimeType = "application/json";
      const body: Record<string, unknown> = { contents, generationConfig };
      if (sys) body.systemInstruction = { parts: [{ text: sys }] };
      const r = await fetch(`${base}/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(`gemini ${r.status} ${await r.text()}`);
      const j = (await r.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
      };
      const text = j.candidates?.[0]?.content?.parts?.map((pt) => pt.text ?? "").join("") ?? "";
      return {
        text,
        model,
        promptTokens: j.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: j.usageMetadata?.candidatesTokenCount ?? 0
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
