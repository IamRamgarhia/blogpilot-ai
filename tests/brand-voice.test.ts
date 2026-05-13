import { describe, it, expect } from "vitest";
import { ruleBasedVoiceProfile } from "@/lib/seo/brand-voice";

describe("ruleBasedVoiceProfile", () => {
  it("detects second-person voice", () => {
    const sample = "You will love this. You can do it yourself. Your team will thank you.";
    const p = ruleBasedVoiceProfile([sample]);
    expect(p.voice).toBe("second-person");
  });
  it("detects first-person voice", () => {
    const sample = "I tried this approach. We saw a 20% lift. My team rebuilt the pipeline. We learned a lot.";
    const p = ruleBasedVoiceProfile([sample]);
    expect(p.voice).toBe("first-person");
  });
  it("detects contractions", () => {
    const sample = "Don't worry, we'll handle it. It's fine.";
    const p = ruleBasedVoiceProfile([sample]);
    expect(p.contractions).toBe(true);
  });
  it("detects title-case headings", () => {
    const sample = "## How To Bake Bread\n\nIntro.\n\n## Best Tools For Bakers\n\nMore.";
    const p = ruleBasedVoiceProfile([sample]);
    expect(p.headingCase).toBe("title");
  });
});
