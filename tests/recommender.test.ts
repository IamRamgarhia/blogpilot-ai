import { describe, it, expect } from "vitest";
import { recommendNext } from "@/lib/measurement/recommender";

describe("recommendNext", () => {
  it("flags quick-win posts ranking 11-30", () => {
    const out = recommendNext({
      posts: [
        { id: "a", title: "A", primaryKeyword: "a", status: "ready", rankPosition: 14 },
        { id: "b", title: "B", primaryKeyword: "b", status: "draft", rankPosition: 14 },
        { id: "c", title: "C", primaryKeyword: "c", status: "draft", rankPosition: 50 }
      ]
    });
    const b = out.find((x) => x.postId === "b");
    expect(b).toBeDefined();
    expect(b!.signals).toContain("quick_win");
  });

  it("excludes ready posts", () => {
    const out = recommendNext({
      posts: [
        { id: "a", title: "A", primaryKeyword: "a", status: "ready" }
      ]
    });
    expect(out.find((x) => x.postId === "a")).toBeUndefined();
  });

  it("flags pillar missing for cluster with 3+ spokes", () => {
    const out = recommendNext({
      posts: [
        { id: "p", title: "Pillar", primaryKeyword: "k", status: "idea", isPillar: true, cluster: "x" }
      ],
      clusterCoverage: { x: { spokeCount: 4 } }
    });
    const item = out.find((x) => x.postId === "p");
    expect(item).toBeDefined();
    expect(item!.signals).toContain("pillar_dependency");
  });

  it("includes gap topics as new-post recommendations", () => {
    const out = recommendNext({
      posts: [],
      gapTopics: [{ topic: "wordpress speed", priority: 1 }]
    });
    expect(out.length).toBe(1);
    expect(out[0].postId).toBeNull();
    expect(out[0].signals).toContain("gap_coverage");
  });

  it("sorts by score descending", () => {
    const out = recommendNext({
      posts: [
        { id: "a", title: "A", primaryKeyword: "a", status: "draft" },                     // base 0 (not idea)
        { id: "b", title: "B", primaryKeyword: "b", status: "idea" },                       // base 5
        { id: "c", title: "C", primaryKeyword: "c", status: "draft", rankPosition: 14 }   // +30 quick_win
      ]
    });
    expect(out[0].postId).toBe("c");
  });

  it("limits to N items", () => {
    const out = recommendNext({
      posts: Array.from({ length: 30 }, (_, i) => ({
        id: `p${i}`,
        title: `P${i}`,
        primaryKeyword: "k",
        status: "idea"
      }))
    }, 5);
    expect(out.length).toBe(5);
  });
});
