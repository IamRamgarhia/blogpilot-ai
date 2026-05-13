import { withFailover } from "./failover";
import type { AIProvider, ChatRequest } from "./provider";
import { methodologyAsPrompt } from "../methodologies/loader";

export interface ExecuteRequest {
  methodologies: string[];
  task: string;
  input: unknown;
  providers: AIProvider[];
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export async function execute(req: ExecuteRequest) {
  const methodBlocks = req.methodologies.map((id) => methodologyAsPrompt(id)).join("\n---\n");
  const systemPrompt = [
    "You are BlogPilot AI's SEO content engine.",
    "Follow the methodologies below EXACTLY. Do not deviate. Do not invent best practices.",
    "If a methodology says output JSON, output ONLY JSON (no prose, no markdown fences).",
    "",
    methodBlocks
  ].join("\n");

  const userPrompt = `Task: ${req.task}\n\nInput:\n${JSON.stringify(req.input, null, 2)}\n\nProduce the output specified by the methodologies above.`;

  const chatReq: ChatRequest = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    jsonMode: req.jsonMode,
    temperature: req.temperature ?? 0.5,
    maxTokens: req.maxTokens ?? 4096
  };

  return withFailover(req.providers, chatReq);
}
