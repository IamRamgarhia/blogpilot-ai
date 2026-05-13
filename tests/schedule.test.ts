import { describe, it, expect } from "vitest";
import { buildSchedule } from "@/lib/seo/schedule";

describe("buildSchedule", () => {
  it("schedules each post on a unique day", () => {
    const out = buildSchedule({
      niche: "saas",
      posts: [
        { id: "a", title: "A", isPillar: true, priority: 1 },
        { id: "b", title: "B", priority: 2 },
        { id: "c", title: "C", priority: 3 }
      ]
    });
    const days = out.map((o) => o.publishDateISO.slice(0, 10));
    expect(new Set(days).size).toBe(3);
  });

  it("pillars come first", () => {
    const out = buildSchedule({
      niche: "saas",
      posts: [
        { id: "spoke1", title: "S1", priority: 1 },
        { id: "pillar", title: "P", isPillar: true, priority: 10 },
        { id: "spoke2", title: "S2", priority: 2 }
      ]
    });
    expect(out[0].postId).toBe("pillar");
  });

  it("saas niche avoids weekends", () => {
    const out = buildSchedule({
      niche: "saas",
      posts: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, title: `P${i}` }))
    });
    for (const o of out) {
      const d = new Date(o.publishDateISO).getUTCDay();
      expect(d).not.toBe(0);
      expect(d).not.toBe(6);
    }
  });

  it("food niche allows weekends", () => {
    const out = buildSchedule({
      niche: "food blog",
      posts: Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, title: `P${i}` }))
    });
    const days = out.map((o) => new Date(o.publishDateISO).getUTCDay());
    // Food primary=Fri(5), secondary=Sun(0). Should include 5 or 0.
    expect(days.some((d) => d === 5 || d === 0)).toBe(true);
  });
});
