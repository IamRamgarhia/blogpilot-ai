export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface ChatResponse {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
}

export interface AIProvider {
  id: string;
  name: string;
  chat(req: ChatRequest): Promise<ChatResponse>;
  test(): Promise<boolean>;
}
