import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

export interface Methodology {
  id: string;
  title: string;
  when?: string;
  inputs?: string;
  outputs?: string;
  source?: string;
  body: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

let cache: Methodology[] | null = null;

function readDir(dir: string): Methodology[] {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files.map((f) => {
    const raw = readFileSync(join(dir, f), "utf8");
    const { data, content } = matter(raw);
    return {
      id: (data.id as string) ?? f.replace(/\.md$/, ""),
      title: (data.title as string) ?? f,
      when: data.when as string | undefined,
      inputs: data.inputs as string | undefined,
      outputs: data.outputs as string | undefined,
      source: data.source as string | undefined,
      body: content.trim()
    };
  });
}

export function loadMethodologies(): Methodology[] {
  if (cache) return cache;
  const builtIn = readDir(__dirname);
  const custom = readDir(join(__dirname, "custom"));
  cache = [...builtIn, ...custom];
  return cache;
}

export function getMethodology(id: string): Methodology | undefined {
  return loadMethodologies().find((m) => m.id === id);
}

export function methodologyAsPrompt(id: string): string {
  const m = getMethodology(id);
  if (!m) throw new Error(`Unknown methodology: ${id}`);
  return `# Methodology: ${m.title}\n${m.source ? `Source: ${m.source}\n` : ""}\n${m.body}\n`;
}

export function clearCache(): void {
  cache = null;
}
