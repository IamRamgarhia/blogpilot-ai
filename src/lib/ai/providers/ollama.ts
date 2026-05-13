import type { AIProvider, ChatRequest, ChatResponse } from "../provider";

export function ollamaProvider(baseUrl = "http://localhost:11434", defaultModel = "llama3.2"): AIProvider {
  return {
    id: "ollama",
    name: "Ollama (local)",
    async chat(req: ChatRequest): Promise<ChatResponse> {
      const model = req.model ?? defaultModel;
      const r = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          messages: req.messages,
          stream: false,
          options: { temperature: req.temperature ?? 0.7 }
        })
      });
      if (!r.ok) throw new Error(`ollama ${r.status} ${await r.text()}`);
      const j = (await r.json()) as {
        message?: { content?: string };
        prompt_eval_count?: number;
        eval_count?: number;
      };
      return {
        text: j.message?.content ?? "",
        model,
        promptTokens: j.prompt_eval_count ?? 0,
        completionTokens: j.eval_count ?? 0
      };
    },
    async test() {
      try {
        const r = await fetch(`${baseUrl.replace(/\/$/, "")}/api/tags`);
        return r.ok;
      } catch {
        return false;
      }
    }
  };
}
