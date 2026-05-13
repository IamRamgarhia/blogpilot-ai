import { describe, it, expect } from "vitest";
import { classifyIntentByRules } from "@/lib/seo/intent";

describe("classifyIntentByRules", () => {
  it("how to → informational + tutorial", () => {
    const r = classifyIntentByRules("how to bake bread");
    expect(r.intent).toBe("informational");
    expect(r.recommended_format).toBe("tutorial");
  });

  it("best X → commercial + listicle", () => {
    const r = classifyIntentByRules("best wordpress plugins");
    expect(r.intent).toBe("commercial");
    expect(r.recommended_format).toBe("listicle");
  });

  it("X vs Y → commercial + comparison-table", () => {
    const r = classifyIntentByRules("nextjs vs remix");
    expect(r.intent).toBe("commercial");
    expect(r.recommended_format).toBe("comparison-table");
  });

  it("buy X → transactional", () => {
    const r = classifyIntentByRules("buy bread maker");
    expect(r.intent).toBe("transactional");
  });

  it("free X tool → transactional", () => {
    const r = classifyIntentByRules("free seo tool");
    expect(r.intent).toBe("transactional");
  });

  it("what is X → informational + definition", () => {
    const r = classifyIntentByRules("what is e-e-a-t");
    expect(r.intent).toBe("informational");
    expect(r.sub_intent).toBe("definition");
  });

  it("ambiguous defaults to informational", () => {
    const r = classifyIntentByRules("seo strategy");
    expect(r.intent).toBe("informational");
    expect(r.confidence).toBeLessThanOrEqual(0.6);
  });
});
