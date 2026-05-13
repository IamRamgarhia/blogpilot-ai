import { describe, it, expect, vi } from "vitest";
import type { AIProvider, ChatRequest } from "@/lib/ai/provider";
import { withFailover } from "@/lib/ai/failover";
import { buildRegistry, chainFor } from "@/lib/ai/registry";

function fakeProvider(name: string, behavior: "ok" | "fail"): AIProvider {
  return {
    id: name,
    name,
    chat: vi.fn(async (req: ChatRequest) => {
      if (behavior === "fail") throw new Error(`${name} down`);
      return {
        text: `reply from ${name}`,
        model: req.model ?? "fake",
        promptTokens: 1,
        completionTokens: 1
      };
    }),
    test: vi.fn(async () => behavior === "ok")
  };
}

describe("failover", () => {
  it("uses first healthy provider", async () => {
    const a = fakeProvider("a", "ok");
    const b = fakeProvider("b", "ok");
    const r = await withFailover([a, b], { messages: [{ role: "user", content: "hi" }] });
    expect(r.text).toBe("reply from a");
  });
  it("falls over when first fails", async () => {
    const a = fakeProvider("a", "fail");
    const b = fakeProvider("b", "ok");
    const r = await withFailover([a, b], { messages: [{ role: "user", content: "hi" }] });
    expect(r.text).toBe("reply from b");
  });
  it("throws when all fail", async () => {
    const a = fakeProvider("a", "fail");
    const b = fakeProvider("b", "fail");
    await expect(
      withFailover([a, b], { messages: [{ role: "user", content: "hi" }] })
    ).rejects.toThrow();
  });
  it("throws clean error with empty chain", async () => {
    await expect(
      withFailover([], { messages: [{ role: "user", content: "hi" }] })
    ).rejects.toThrow(/No AI providers/);
  });
});

describe("registry", () => {
  it("empty env produces empty registry", () => {
    expect(buildRegistry({})).toEqual([]);
  });
  it("includes only configured providers, sorted by priority", () => {
    const reg = buildRegistry({
      GEMINI_API_KEY: "g",
      ANTHROPIC_API_KEY: "a",
      OLLAMA_ENABLED: "1"
    });
    const ids = chainFor(reg).map((p) => p.id);
    expect(ids).toEqual(["anthropic", "gemini", "ollama"]);
  });
});
