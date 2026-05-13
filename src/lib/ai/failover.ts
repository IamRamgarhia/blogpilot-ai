import type { AIProvider, ChatRequest, ChatResponse } from "./provider";

export async function withFailover(providers: AIProvider[], req: ChatRequest): Promise<ChatResponse> {
  if (providers.length === 0) {
    throw new Error("No AI providers configured. Set at least one provider key in Settings.");
  }
  const errors: string[] = [];
  for (const p of providers) {
    try {
      return await p.chat(req);
    } catch (e) {
      errors.push(`${p.id}: ${(e as Error).message}`);
    }
  }
  throw new Error(`All AI providers failed.\n${errors.join("\n")}`);
}
