import { z } from "zod";

const schema = z.object({
  BLOGPILOT_DB_PATH: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  TOGETHER_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  CEREBRAS_API_KEY: z.string().optional(),
  PERPLEXITY_API_KEY: z.string().optional(),
  LMSTUDIO_BASE_URL: z.string().optional(),
  OLLAMA_BASE_URL: z.string().optional(),
  OLLAMA_ENABLED: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),
  DICE_LEAD_WEBHOOK: z.string().url().optional()
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
