import { describe, it, expect } from "vitest";
import { csvEscape } from "@/lib/exports/common";
import { buildWebflowCsv } from "@/lib/exports/webflow-csv";
import type { ExportPost } from "@/lib/exports/common";

describe("csvEscape — formula injection guard", () => {
  it("prefixes cells starting with = (no wrapping needed if no comma/newline)", () => {
    expect(csvEscape("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
  });
  it("prefixes AND quotes when cell also contains a comma", () => {
    expect(csvEscape("=A1,B1")).toBe(`"'=A1,B1"`);
  });
  it("prefixes cells starting with +", () => {
    expect(csvEscape("+1234")).toContain("'+1234");
  });
  it("prefixes cells starting with -", () => {
    expect(csvEscape("-2+3")).toContain("'-2+3");
  });
  it("prefixes cells starting with @", () => {
    expect(csvEscape("@SUM")).toContain("'@SUM");
  });
  it("does not prefix safe cells", () => {
    expect(csvEscape("Hello world")).toBe("Hello world");
    expect(csvEscape("normal slug-text-2026")).toBe("normal slug-text-2026");
  });
  it("still quotes comma-containing cells", () => {
    expect(csvEscape("a, b, c")).toBe(`"a, b, c"`);
  });
  it("escapes embedded quotes", () => {
    expect(csvEscape(`say "hi"`)).toBe(`"say ""hi"""`);
  });
});

describe("Webflow CSV — formula injection neutralization", () => {
  it("neutralizes a malicious title", () => {
    const malicious: ExportPost = {
      id: "p",
      title: `=HYPERLINK("http://attacker.example","gotcha")`,
      slug: "p",
      metaTitle: "ok",
      metaDescription: "ok",
      primaryKeyword: "ok",
      draftMarkdown: "# Title",
      schemaJsonLd: "{}",
      cluster: "c"
    };
    const csv = buildWebflowCsv([malicious]);
    const rowLine = csv.split("\n")[1];
    expect(rowLine.startsWith(`"'=HYPERLINK`)).toBe(true);
  });
});
