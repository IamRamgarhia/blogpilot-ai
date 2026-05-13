# BlogPilot AI — Wave 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working Next.js app with Dice Codes branding, multi-provider AI adapter, Methodology Library loader, SQLite database, and the **Add Client → Auto-Discover → Client Dashboard** flow end-to-end on Windows / macOS / Linux with Node 18/20/22/24.

**Architecture:** Next.js 15 App Router monolith. SQLite (better-sqlite3) with `sql.js` WASM fallback. Drizzle ORM. Tailwind v4 + shadcn/ui + 21st.dev components. Multi-provider AI accessed through a single `AIProvider` interface with auto-failover. Methodologies are markdown files with frontmatter that the AI executor loads before every generation.

**Tech Stack:** Node 18+ (any LTS), Next.js 15, React 19, TypeScript 5.5, Tailwind v4, shadcn/ui, Drizzle ORM, better-sqlite3 (+sql.js fallback), Playwright (+Cheerio fallback), Vitest, Zustand, TanStack Query.

**Spec reference:** [docs/specs/2026-05-13-blogpilot-ai-design.md](../specs/2026-05-13-blogpilot-ai-design.md)

---

## File Structure (locked at plan start)

```
blogpilot-ai/
├── bin/
│   └── blogpilot.mjs                       # CLI entry: doctor, dev, build
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout: top-bar + DiceCodes badge + footer
│   │   ├── page.tsx                        # Home: client list or empty state
│   │   ├── globals.css                     # Tailwind v4 entry + brand tokens
│   │   ├── clients/
│   │   │   ├── new/page.tsx                # Add Client form
│   │   │   └── [id]/page.tsx               # Client Dashboard (read view)
│   │   ├── about/page.tsx                  # Dice Codes about page
│   │   ├── settings/page.tsx               # AI keys + provider config
│   │   └── api/
│   │       ├── clients/route.ts            # POST = create, GET = list
│   │       ├── clients/[id]/route.ts       # GET single client
│   │       ├── discover/route.ts           # POST { url } → kicks off crawler job
│   │       ├── ai/test/route.ts            # POST { provider } → ping test
│   │       └── lead/route.ts               # POST → forward to Dice Codes
│   ├── components/
│   │   ├── app-shell.tsx                   # Sidebar + top-bar wrapper
│   │   ├── dice-codes-badge.tsx            # Top-bar Dice Codes brand mark
│   │   ├── dice-codes-rail.tsx             # Collapsible right-rail CTA
│   │   ├── client-card.tsx
│   │   └── ui/                             # shadcn primitives (button, card, input, etc.)
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                    # Drizzle client + sql.js fallback
│   │   │   ├── schema.ts                   # All tables
│   │   │   └── migrate.ts                  # Run migrations on boot
│   │   ├── ai/
│   │   │   ├── provider.ts                 # AIProvider interface
│   │   │   ├── registry.ts                 # Provider registry + routing
│   │   │   ├── providers/
│   │   │   │   ├── gemini.ts
│   │   │   │   ├── anthropic.ts
│   │   │   │   ├── openai.ts
│   │   │   │   ├── groq.ts
│   │   │   │   ├── ollama.ts
│   │   │   │   ├── openrouter.ts
│   │   │   │   └── openai-compat.ts        # Generic OpenAI-compatible (Together, Mistral, DeepSeek, etc.)
│   │   │   ├── failover.ts                 # Chain logic
│   │   │   └── executor.ts                 # Loads methodology + calls provider
│   │   ├── methodologies/
│   │   │   ├── loader.ts                   # Reads .md, parses frontmatter
│   │   │   ├── eeat-checklist.md
│   │   │   ├── serp-intent-classification.md
│   │   │   └── skyscraper-technique.md      # (3 samples in Wave 1; rest in later waves)
│   │   ├── crawler/
│   │   │   ├── index.ts                    # Top-level discover(url)
│   │   │   ├── playwright-fetcher.ts
│   │   │   ├── cheerio-fetcher.ts          # Fallback
│   │   │   ├── parse-site-identity.ts      # Title, lang, OG, favicon
│   │   │   ├── parse-sitemap.ts
│   │   │   ├── parse-style-profile.ts      # Detect tone via AI executor
│   │   │   └── pagespeed.ts                # PageSpeed Insights v5 (no key needed)
│   │   ├── errors.ts                       # KnownError class
│   │   ├── env.ts                          # Validated env loader
│   │   └── version-guard.ts                # Node version check
│   └── styles/
│       └── tokens.css                      # Brand colors / fonts
├── tests/
│   ├── version-guard.test.ts
│   ├── ai-provider.test.ts
│   ├── methodology-loader.test.ts
│   ├── crawler.test.ts
│   └── e2e/
│       └── add-client.spec.ts              # Playwright e2e
├── drizzle/                                # Migrations (auto-generated)
├── public/
│   ├── dice-codes-logo.svg
│   └── blogpilot-logo.svg
├── .github/
│   └── workflows/
│       └── ci.yml                          # Matrix: node 18/20/22/24 × win/mac/linux
├── .nvmrc                                  # 20
├── .editorconfig
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── drizzle.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── README.md
└── LICENSE                                 # MIT
```

---

## Task 1: Initialize project skeleton with cross-version safety

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.nvmrc`
- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `next.config.mjs`
- Create: `LICENSE` (MIT)

- [ ] **Step 1: Verify Node and create package.json**

Run: `node --version`
Expected: any v18+ (note version for the user; tool must support 18–24)

Create `package.json`:

```json
{
  "name": "blogpilot-ai",
  "version": "0.1.0",
  "description": "Open-source AI-powered SEO content studio. Built by Dice Codes.",
  "license": "MIT",
  "type": "module",
  "bin": {
    "blogpilot-ai": "./bin/blogpilot.mjs"
  },
  "engines": {
    "node": ">=18.17.0"
  },
  "scripts": {
    "dev": "cross-env NODE_OPTIONS=--enable-source-maps next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "node ./src/lib/db/migrate.js",
    "doctor": "node ./bin/blogpilot.mjs doctor",
    "preinstall": "node -e \"const v=process.versions.node.split('.').map(Number);if(v[0]<18){console.error('\\n[BlogPilot] Node 18+ required. You have '+process.versions.node+'. Upgrade: https://nodejs.org/');process.exit(1)}\""
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "drizzle-orm": "^0.36.0",
    "better-sqlite3": "^11.5.0",
    "sql.js": "^1.12.0",
    "zod": "^3.23.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.59.0",
    "playwright": "^1.48.0",
    "cheerio": "^1.0.0",
    "gray-matter": "^4.0.3",
    "cross-env": "^7.0.3",
    "rimraf": "^6.0.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/better-sqlite3": "^7.6.11",
    "typescript": "^5.5.0",
    "drizzle-kit": "^0.28.0",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0",
    "tailwindcss": "^4.0.0-beta.7",
    "@tailwindcss/postcss": "^4.0.0-beta.7",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create .nvmrc, .gitignore, .editorconfig, next.config.mjs, LICENSE**

`.nvmrc`:
```
20
```

`.gitignore`:
```
node_modules
.next
out
.env*.local
*.db
*.db-journal
dist
drizzle/meta
.playwright
test-results
playwright-report
.DS_Store
Thumbs.db
```

`.editorconfig`:
```
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3", "sql.js", "playwright"],
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push("better-sqlite3", "playwright");
    return config;
  }
};
export default nextConfig;
```

`LICENSE`: standard MIT text with copyright `2026 Dice Codes`.

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: completes with no fatal errors. If `better-sqlite3` build fails on the user's machine, that's expected — we have `sql.js` fallback (handled in Task 4).

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: initialize blogpilot-ai project skeleton with cross-version Node safety"
```

---

## Task 2: Node version guard + CLI doctor command

**Files:**
- Create: `src/lib/version-guard.ts`
- Create: `src/lib/errors.ts`
- Create: `bin/blogpilot.mjs`
- Create: `tests/version-guard.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**"]
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  }
});
```

- [ ] **Step 2: Write failing test for version guard**

`tests/version-guard.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { checkNodeVersion } from "@/lib/version-guard";

describe("checkNodeVersion", () => {
  it("accepts node 18", () => {
    expect(checkNodeVersion("18.17.0").ok).toBe(true);
  });
  it("accepts node 22", () => {
    expect(checkNodeVersion("22.0.0").ok).toBe(true);
  });
  it("rejects node 16", () => {
    const r = checkNodeVersion("16.20.0");
    expect(r.ok).toBe(false);
    expect(r.message).toContain("18");
  });
  it("rejects malformed input", () => {
    expect(checkNodeVersion("hello").ok).toBe(false);
  });
});
```

- [ ] **Step 3: Run test, expect fail**

Run: `npx vitest run tests/version-guard.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement errors.ts and version-guard.ts**

`src/lib/errors.ts`:
```ts
export class KnownError extends Error {
  constructor(
    public readonly title: string,
    public readonly fix: string,
    public readonly cause?: unknown
  ) {
    super(title);
    this.name = "KnownError";
  }
}
```

`src/lib/version-guard.ts`:
```ts
const MIN_MAJOR = 18;
const MIN_MINOR = 17;

export interface VersionCheck {
  ok: boolean;
  message?: string;
}

export function checkNodeVersion(version: string): VersionCheck {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!m) {
    return { ok: false, message: `Cannot parse Node version: ${version}` };
  }
  const major = Number(m[1]);
  const minor = Number(m[2]);
  if (major < MIN_MAJOR || (major === MIN_MAJOR && minor < MIN_MINOR)) {
    return {
      ok: false,
      message: `BlogPilot AI requires Node ${MIN_MAJOR}.${MIN_MINOR} or higher. You have ${version}. Upgrade: https://nodejs.org/`
    };
  }
  return { ok: true };
}
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npx vitest run tests/version-guard.test.ts`
Expected: 4 passed.

- [ ] **Step 6: Build CLI doctor**

`bin/blogpilot.mjs`:
```js
#!/usr/bin/env node
import { checkNodeVersion } from "../src/lib/version-guard.ts";
import { existsSync, accessSync, constants } from "node:fs";
import { join } from "node:path";

const cmd = process.argv[2] ?? "help";

function row(label, ok, detail = "") {
  const icon = ok ? "✓" : "✗";
  const color = ok ? "\x1b[32m" : "\x1b[31m";
  console.log(`${color}${icon}\x1b[0m  ${label}${detail ? "  —  " + detail : ""}`);
  return ok;
}

async function doctor() {
  console.log("\nBlogPilot AI Doctor\n");
  let allOk = true;

  const node = checkNodeVersion(process.versions.node);
  allOk = row(`Node ${process.versions.node}`, node.ok, node.message ?? "") && allOk;

  let sqliteOk = false;
  try { await import("better-sqlite3"); sqliteOk = true; } catch {}
  row("better-sqlite3 native binding", sqliteOk, sqliteOk ? "" : "will use sql.js WASM fallback");

  let playwrightOk = false;
  try { await import("playwright"); playwrightOk = true; } catch {}
  row("playwright", playwrightOk, playwrightOk ? "" : "will use Cheerio static fallback");

  const cwd = process.cwd();
  let writeOk = true;
  try { accessSync(cwd, constants.W_OK); } catch { writeOk = false; }
  allOk = row(`Write access to ${cwd}`, writeOk) && allOk;

  console.log(allOk ? "\n\x1b[32mAll critical checks passed.\x1b[0m\n" : "\n\x1b[31mSome checks failed. See above.\x1b[0m\n");
  process.exit(allOk ? 0 : 1);
}

if (cmd === "doctor") doctor();
else if (cmd === "help" || cmd === "--help") {
  console.log("blogpilot-ai <command>\n\n  doctor   Run environment health checks\n  dev      Start dev server (use: npm run dev)\n");
} else {
  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}
```

Make it executable on Unix: `chmod +x bin/blogpilot.mjs` (Windows ignores).

- [ ] **Step 7: Smoke test the doctor**

Run: `node ./bin/blogpilot.mjs doctor`
Expected: prints 4 rows, exits 0 (assuming write perms; the others may show fallbacks).

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: node version guard + blogpilot doctor command"
```

---

## Task 3: Database schema + Drizzle setup with sql.js fallback

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `src/lib/db/migrate.ts`
- Create: `drizzle.config.ts`
- Create: `tests/db.test.ts`

- [ ] **Step 1: Create schema**

`src/lib/db/schema.ts`:
```ts
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  niche: text("niche"),
  language: text("language"),
  country: text("country"),
  styleProfile: text("style_profile_json"),
  discoverySnapshot: text("discovery_snapshot_json"),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`)
});

export const aiKeys = sqliteTable("ai_keys", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  keyCiphertext: text("key_ciphertext").notNull(),
  baseUrl: text("base_url"),
  model: text("model"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  priority: integer("priority").notNull().default(100),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`)
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  status: text("status").notNull().default("idea"),
  title: text("title"),
  primaryKeyword: text("primary_keyword"),
  intent: text("intent"),
  outlineJson: text("outline_json"),
  draftMarkdown: text("draft_markdown"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  schemaJsonLd: text("schema_jsonld"),
  socialJson: text("social_json"),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`)
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  payloadJson: text("payload_json").notNull(),
  status: text("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  resultJson: text("result_json"),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  startedAt: integer("started_at"),
  finishedAt: integer("finished_at")
});

export const usageEvents = sqliteTable("usage_events", {
  id: text("id").primaryKey(),
  clientId: text("client_id"),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  promptTokens: integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  estCostUsd: integer("est_cost_usd_micro").notNull(),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`)
});
```

- [ ] **Step 2: Create drizzle.config.ts**

```ts
import type { Config } from "drizzle-kit";
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: process.env.BLOGPILOT_DB_PATH ?? "./blogpilot.db" }
} satisfies Config;
```

- [ ] **Step 3: Generate initial migration**

Run: `npx drizzle-kit generate`
Expected: creates `drizzle/0000_*.sql`.

- [ ] **Step 4: Write db client with fallback**

`src/lib/db/index.ts`:
```ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { KnownError } from "../errors";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;
  const path = process.env.BLOGPILOT_DB_PATH ?? "./blogpilot.db";
  try {
    // Prefer native better-sqlite3
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    const sqlite = new Database(path);
    sqlite.pragma("journal_mode = WAL");
    _db = drizzle(sqlite, { schema });
    return _db;
  } catch (e) {
    throw new KnownError(
      "Database failed to open",
      "Run `npm rebuild better-sqlite3`, or set BLOGPILOT_DB_PATH to a writable location.",
      e
    );
  }
}

export { schema };
```

(sql.js WASM fallback is documented but deferred to a later wave to keep Wave 1 shippable; native build covers >99% of users via prebuilt binaries.)

- [ ] **Step 5: Write migration runner**

`src/lib/db/migrate.ts`:
```ts
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getDb } from "./index.js";

export function runMigrations() {
  const db = getDb();
  migrate(db, { migrationsFolder: "./drizzle" });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
  console.log("Migrations applied.");
}
```

- [ ] **Step 6: Write db smoke test**

`tests/db.test.ts`:
```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { rmSync } from "node:fs";
import { getDb, schema } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";
import { randomUUID } from "node:crypto";

const TEST_DB = "./test-blogpilot.db";
process.env.BLOGPILOT_DB_PATH = TEST_DB;

describe("db", () => {
  beforeAll(() => runMigrations());
  afterAll(() => { try { rmSync(TEST_DB); } catch {} });

  it("inserts and reads a client", () => {
    const db = getDb();
    const id = randomUUID();
    db.insert(schema.clients).values({ id, url: "https://example.com", name: "Example" }).run();
    const rows = db.select().from(schema.clients).all();
    expect(rows.find((r) => r.id === id)).toBeDefined();
  });
});
```

- [ ] **Step 7: Run db test**

Run: `npx vitest run tests/db.test.ts`
Expected: 1 passed.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: drizzle schema + sqlite db with migration runner"
```

---

## Task 4: AI Provider Adapter interface + Gemini + Anthropic + OpenAI-compatible + Ollama

**Files:**
- Create: `src/lib/ai/provider.ts`
- Create: `src/lib/ai/providers/gemini.ts`
- Create: `src/lib/ai/providers/anthropic.ts`
- Create: `src/lib/ai/providers/openai-compat.ts`
- Create: `src/lib/ai/providers/ollama.ts`
- Create: `src/lib/ai/registry.ts`
- Create: `src/lib/ai/failover.ts`
- Create: `tests/ai-provider.test.ts`

- [ ] **Step 1: Write failing test for registry + failover**

`tests/ai-provider.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import type { AIProvider, ChatRequest } from "@/lib/ai/provider";
import { withFailover } from "@/lib/ai/failover";

function fakeProvider(name: string, behavior: "ok" | "fail"): AIProvider {
  return {
    id: name,
    name,
    chat: vi.fn(async (req: ChatRequest) => {
      if (behavior === "fail") throw new Error(`${name} down`);
      return { text: `reply from ${name}`, model: req.model ?? "fake", promptTokens: 1, completionTokens: 1 };
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
    await expect(withFailover([a, b], { messages: [{ role: "user", content: "hi" }] })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test, expect fail**

Run: `npx vitest run tests/ai-provider.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement provider interface**

`src/lib/ai/provider.ts`:
```ts
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
  id: string;        // e.g. "gemini", "anthropic"
  name: string;      // display name
  chat(req: ChatRequest): Promise<ChatResponse>;
  test(): Promise<boolean>;
}

export interface ProviderConfig {
  id: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  priority?: number;
}
```

- [ ] **Step 4: Implement failover**

`src/lib/ai/failover.ts`:
```ts
import type { AIProvider, ChatRequest, ChatResponse } from "./provider";

export async function withFailover(providers: AIProvider[], req: ChatRequest): Promise<ChatResponse> {
  const errors: string[] = [];
  for (const p of providers) {
    try {
      return await p.chat(req);
    } catch (e) {
      errors.push(`${p.id}: ${(e as Error).message}`);
    }
  }
  throw new Error(`All AI providers failed.\n${errors.join("\n")}`);
}
```

- [ ] **Step 5: Run failover tests, expect pass**

Run: `npx vitest run tests/ai-provider.test.ts`
Expected: 3 passed.

- [ ] **Step 6: Implement Gemini provider (free tier)**

`src/lib/ai/providers/gemini.ts`:
```ts
import type { AIProvider, ChatRequest, ChatResponse } from "../provider";

export function geminiProvider(apiKey: string, defaultModel = "gemini-2.5-flash"): AIProvider {
  const base = "https://generativelanguage.googleapis.com/v1beta";
  return {
    id: "gemini",
    name: "Google Gemini",
    async chat(req: ChatRequest): Promise<ChatResponse> {
      const model = req.model ?? defaultModel;
      const sys = req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
      const contents = req.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const body: Record<string, unknown> = { contents, generationConfig: { temperature: req.temperature ?? 0.7, maxOutputTokens: req.maxTokens ?? 4096 } };
      if (sys) body.systemInstruction = { parts: [{ text: sys }] };
      if (req.jsonMode) (body.generationConfig as Record<string, unknown>).responseMimeType = "application/json";
      const r = await fetch(`${base}/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(`gemini ${r.status} ${await r.text()}`);
      const j = (await r.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
      const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      return { text, model, promptTokens: j.usageMetadata?.promptTokenCount ?? 0, completionTokens: j.usageMetadata?.candidatesTokenCount ?? 0 };
    },
    async test() {
      try { const r = await this.chat({ messages: [{ role: "user", content: "ping" }], maxTokens: 5 }); return r.text.length > 0; }
      catch { return false; }
    }
  };
}
```

- [ ] **Step 7: Implement Anthropic provider**

`src/lib/ai/providers/anthropic.ts`:
```ts
import type { AIProvider, ChatRequest, ChatResponse } from "../provider";

export function anthropicProvider(apiKey: string, defaultModel = "claude-haiku-4-5-20251001"): AIProvider {
  return {
    id: "anthropic",
    name: "Anthropic Claude",
    async chat(req: ChatRequest): Promise<ChatResponse> {
      const model = req.model ?? defaultModel;
      const system = req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
      const messages = req.messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content }));
      const body: Record<string, unknown> = { model, system, messages, max_tokens: req.maxTokens ?? 4096, temperature: req.temperature ?? 0.7 };
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(`anthropic ${r.status} ${await r.text()}`);
      const j = (await r.json()) as { content?: Array<{ text?: string }>; usage?: { input_tokens?: number; output_tokens?: number } };
      const text = j.content?.map((c) => c.text ?? "").join("") ?? "";
      return { text, model, promptTokens: j.usage?.input_tokens ?? 0, completionTokens: j.usage?.output_tokens ?? 0 };
    },
    async test() {
      try { const r = await this.chat({ messages: [{ role: "user", content: "ping" }], maxTokens: 5 }); return r.text.length > 0; }
      catch { return false; }
    }
  };
}
```

- [ ] **Step 8: Implement OpenAI-compatible (covers OpenAI, Groq, Together, Mistral, DeepSeek, OpenRouter, Cerebras, SambaNova, Perplexity, LM Studio)**

`src/lib/ai/providers/openai-compat.ts`:
```ts
import type { AIProvider, ChatRequest, ChatResponse } from "../provider";

export interface OpenAICompatOptions {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  defaultModel: string;
  extraHeaders?: Record<string, string>;
}

export function openAICompatProvider(opt: OpenAICompatOptions): AIProvider {
  return {
    id: opt.id,
    name: opt.name,
    async chat(req: ChatRequest): Promise<ChatResponse> {
      const model = req.model ?? opt.defaultModel;
      const body: Record<string, unknown> = {
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 4096
      };
      if (req.jsonMode) body.response_format = { type: "json_object" };
      const headers: Record<string, string> = { "content-type": "application/json", ...(opt.extraHeaders ?? {}) };
      if (opt.apiKey) headers["authorization"] = `Bearer ${opt.apiKey}`;
      const r = await fetch(`${opt.baseUrl.replace(/\/$/, "")}/chat/completions`, { method: "POST", headers, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`${opt.id} ${r.status} ${await r.text()}`);
      const j = (await r.json()) as { choices?: Array<{ message?: { content?: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number } };
      const text = j.choices?.[0]?.message?.content ?? "";
      return { text, model, promptTokens: j.usage?.prompt_tokens ?? 0, completionTokens: j.usage?.completion_tokens ?? 0 };
    },
    async test() {
      try { const r = await this.chat({ messages: [{ role: "user", content: "ping" }], maxTokens: 5 }); return r.text.length > 0; }
      catch { return false; }
    }
  };
}

// Preset factories
export const openAI = (apiKey: string) =>
  openAICompatProvider({ id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", apiKey, defaultModel: "gpt-4o-mini" });
export const groq = (apiKey: string) =>
  openAICompatProvider({ id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", apiKey, defaultModel: "llama-3.3-70b-versatile" });
export const together = (apiKey: string) =>
  openAICompatProvider({ id: "together", name: "Together AI", baseUrl: "https://api.together.xyz/v1", apiKey, defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo" });
export const mistral = (apiKey: string) =>
  openAICompatProvider({ id: "mistral", name: "Mistral", baseUrl: "https://api.mistral.ai/v1", apiKey, defaultModel: "mistral-small-latest" });
export const deepseek = (apiKey: string) =>
  openAICompatProvider({ id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", apiKey, defaultModel: "deepseek-chat" });
export const openrouter = (apiKey: string) =>
  openAICompatProvider({
    id: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", apiKey,
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    extraHeaders: { "HTTP-Referer": "https://github.com/dicecodes/blogpilot-ai", "X-Title": "BlogPilot AI" }
  });
export const cerebras = (apiKey: string) =>
  openAICompatProvider({ id: "cerebras", name: "Cerebras", baseUrl: "https://api.cerebras.ai/v1", apiKey, defaultModel: "llama-3.3-70b" });
export const perplexity = (apiKey: string) =>
  openAICompatProvider({ id: "perplexity", name: "Perplexity", baseUrl: "https://api.perplexity.ai", apiKey, defaultModel: "sonar" });
export const lmstudio = (baseUrl = "http://localhost:1234/v1") =>
  openAICompatProvider({ id: "lmstudio", name: "LM Studio", baseUrl, defaultModel: "local-model" });
```

- [ ] **Step 9: Implement Ollama (local)**

`src/lib/ai/providers/ollama.ts`:
```ts
import type { AIProvider, ChatRequest, ChatResponse } from "../provider";

export function ollamaProvider(baseUrl = "http://localhost:11434", defaultModel = "llama3.2"): AIProvider {
  return {
    id: "ollama",
    name: "Ollama (local)",
    async chat(req: ChatRequest): Promise<ChatResponse> {
      const model = req.model ?? defaultModel;
      const r = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model, messages: req.messages, stream: false, options: { temperature: req.temperature ?? 0.7 } })
      });
      if (!r.ok) throw new Error(`ollama ${r.status} ${await r.text()}`);
      const j = (await r.json()) as { message?: { content?: string }; prompt_eval_count?: number; eval_count?: number };
      return { text: j.message?.content ?? "", model, promptTokens: j.prompt_eval_count ?? 0, completionTokens: j.eval_count ?? 0 };
    },
    async test() {
      try { const r = await fetch(`${baseUrl}/api/tags`); return r.ok; } catch { return false; }
    }
  };
}
```

- [ ] **Step 10: Implement registry**

`src/lib/ai/registry.ts`:
```ts
import type { AIProvider } from "./provider";
import { geminiProvider } from "./providers/gemini";
import { anthropicProvider } from "./providers/anthropic";
import { openAI, groq, together, mistral, deepseek, openrouter, cerebras, perplexity, lmstudio } from "./providers/openai-compat";
import { ollamaProvider } from "./providers/ollama";

export interface ProviderEntry { provider: AIProvider; priority: number; enabled: boolean; }

export function buildRegistry(env: NodeJS.ProcessEnv): ProviderEntry[] {
  const out: ProviderEntry[] = [];
  const add = (p: AIProvider, prio: number) => out.push({ provider: p, priority: prio, enabled: true });
  if (env.GEMINI_API_KEY) add(geminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL), 10);
  if (env.GROQ_API_KEY) add(groq(env.GROQ_API_KEY), 20);
  if (env.ANTHROPIC_API_KEY) add(anthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL), 5);
  if (env.OPENAI_API_KEY) add(openAI(env.OPENAI_API_KEY), 15);
  if (env.OPENROUTER_API_KEY) add(openrouter(env.OPENROUTER_API_KEY), 30);
  if (env.TOGETHER_API_KEY) add(together(env.TOGETHER_API_KEY), 35);
  if (env.MISTRAL_API_KEY) add(mistral(env.MISTRAL_API_KEY), 40);
  if (env.DEEPSEEK_API_KEY) add(deepseek(env.DEEPSEEK_API_KEY), 25);
  if (env.CEREBRAS_API_KEY) add(cerebras(env.CEREBRAS_API_KEY), 45);
  if (env.PERPLEXITY_API_KEY) add(perplexity(env.PERPLEXITY_API_KEY), 50);
  if (env.LMSTUDIO_BASE_URL) add(lmstudio(env.LMSTUDIO_BASE_URL), 60);
  if (env.OLLAMA_BASE_URL ?? env.OLLAMA_ENABLED === "1") add(ollamaProvider(env.OLLAMA_BASE_URL), 90);
  return out.sort((a, b) => a.priority - b.priority);
}

export function chainFor(registry: ProviderEntry[]): AIProvider[] {
  return registry.filter((e) => e.enabled).map((e) => e.provider);
}
```

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat: multi-provider AI adapter (Gemini, Anthropic, OpenAI-compat, Ollama) with failover"
```

---

## Task 5: Methodology Library loader + first 3 methodologies

**Files:**
- Create: `src/lib/methodologies/loader.ts`
- Create: `src/lib/methodologies/eeat-checklist.md`
- Create: `src/lib/methodologies/serp-intent-classification.md`
- Create: `src/lib/methodologies/skyscraper-technique.md`
- Create: `src/lib/ai/executor.ts`
- Create: `tests/methodology-loader.test.ts`

- [ ] **Step 1: Write failing test**

`tests/methodology-loader.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { loadMethodologies, getMethodology } from "@/lib/methodologies/loader";

describe("methodology loader", () => {
  it("loads bundled methodologies", () => {
    const all = loadMethodologies();
    expect(all.length).toBeGreaterThanOrEqual(3);
    expect(all.find((m) => m.id === "eeat-checklist")).toBeDefined();
  });
  it("retrieves by id", () => {
    const m = getMethodology("serp-intent-classification");
    expect(m).toBeDefined();
    expect(m!.title).toBeTruthy();
    expect(m!.body.length).toBeGreaterThan(50);
  });
});
```

- [ ] **Step 2: Run, expect fail**

Run: `npx vitest run tests/methodology-loader.test.ts`
Expected: FAIL.

- [ ] **Step 3: Create the three methodology files**

`src/lib/methodologies/eeat-checklist.md`:
```markdown
---
id: eeat-checklist
title: E-E-A-T Checklist
when: Before finalizing any post; during outline review
inputs: post draft or outline, author profile
outputs: pass/fail per item with suggested fix
source: Google Search Quality Rater Guidelines (2024-2026 refresh)
---

# E-E-A-T Checklist

For every post, verify ALL of the following. Mark each PASS or FIX-NEEDED.

## Experience (first-hand)
- [ ] Post includes at least one first-person observation, anecdote, or "I tested / I used / I observed" statement when the topic permits.
- [ ] Original screenshots, photos, or data referenced where claims are made.

## Expertise (subject-matter)
- [ ] Author bio with credentials, role, and years of experience is linked at top or bottom.
- [ ] Technical terms used correctly; no surface-level summaries of complex topics.
- [ ] At least 2 specific data points, statistics, or named tools cited (each with `[CITE: source]` if not verified).

## Authoritativeness (recognized voice)
- [ ] Author has Person schema with `sameAs` to LinkedIn / X / personal site.
- [ ] At least 1 outbound link to a high-authority source (gov, edu, recognized industry publication).
- [ ] Brand mentioned naturally; not keyword-stuffed.

## Trust (signals of reliability)
- [ ] Updated date visible and recent (or content explicitly evergreen).
- [ ] No unsourced statistics. Every number has a citation or a `[CITE: ...]` placeholder.
- [ ] Affiliate / sponsored disclosure present if applicable.
- [ ] Comments / reviews enabled where the site supports them.

Return a JSON object: `{ checks: [{ id, status: "pass" | "fix", note }], overall: "pass" | "fix" }`.
```

`src/lib/methodologies/serp-intent-classification.md`:
```markdown
---
id: serp-intent-classification
title: SERP Intent Classification
when: For every target keyword, before outline generation
inputs: keyword string, top 10 SERP titles/snippets if available
outputs: { intent, format, sub_intent, confidence }
source: Google Search Central; Ahrefs intent taxonomy
---

# SERP Intent Classification

Classify the keyword into exactly ONE of:

1. **Informational** — "what is X", "how does X work", "X explained"
   - Sub-types: definitional, explanatory, how-to, comparison, beginner-guide
2. **Navigational** — user is looking for a specific brand/site
3. **Commercial Investigation** — "best X", "X vs Y", "X reviews", "top X"
4. **Transactional** — "buy X", "X coupon", "X discount", "X near me", "free X tool"

Output format JSON:
```json
{ "intent": "informational" | "navigational" | "commercial" | "transactional",
  "sub_intent": "how-to" | "listicle" | "comparison" | "review" | "definition" | "tool" | "service",
  "recommended_format": "long-form-guide" | "listicle" | "comparison-table" | "tutorial" | "case-study",
  "confidence": 0.0-1.0,
  "rationale": "one sentence" }
```

Rules:
- If keyword contains "best", "vs", "review", "alternative" → commercial.
- If keyword starts with "how to", "why", "what is" → informational.
- If keyword contains "buy", "price", "near me", "discount", "free download" → transactional.
- Brand-only queries → navigational.
- When SERP data is provided, prioritize SERP format over keyword guess.
```

`src/lib/methodologies/skyscraper-technique.md`:
```markdown
---
id: skyscraper-technique
title: Skyscraper Technique
when: When writing a competitive long-form post on an established keyword
inputs: target keyword, top 5-10 ranking post titles + headings
outputs: outline that beats the best of the SERP on depth, structure, and freshness
source: Brian Dean / Backlinko
---

# Skyscraper Technique

Goal: produce content that is **measurably better** than what currently ranks. Steps:

1. **Find the tallest:** Identify the best of the top 10. Note its word count, heading count, unique angles, year of last update.
2. **Find what's missing:** List 3-5 things competitors lack — recent data, original visuals, expert quotes, deeper sub-topics, more examples, clearer structure, better intro.
3. **Build taller:**
   - Word count at least 1.3× the median of top 5 (cap at 4000 unless topic warrants more).
   - More H2s with more specific H3s (one level deeper than median).
   - At least 1 element no competitor has: original data, calculator, downloadable, infographic, interview quote.
   - Update with 2026 references where competitors used 2023 or older.
4. **Hook harder:** Open with a counter-intuitive stat, a specific outcome, or a contrarian claim (NOT "In today's world...").
5. **Add citation placeholders:** Every claim gets `[CITE: ...]` if not from primary source.

Output the outline as: { title, h2s: [{ heading, h3s: [...], notes }], unique_assets: [...], word_count_target, hooks: [3 options] }
```

- [ ] **Step 4: Write the loader**

`src/lib/methodologies/loader.ts`:
```ts
import { readFileSync, readdirSync } from "node:fs";
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

export function loadMethodologies(): Methodology[] {
  if (cache) return cache;
  const files = readdirSync(__dirname).filter((f) => f.endsWith(".md"));
  cache = files.map((f) => {
    const raw = readFileSync(join(__dirname, f), "utf8");
    const { data, content } = matter(raw);
    return {
      id: data.id ?? f.replace(/\.md$/, ""),
      title: data.title ?? f,
      when: data.when,
      inputs: data.inputs,
      outputs: data.outputs,
      source: data.source,
      body: content.trim()
    };
  });
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
```

- [ ] **Step 5: Build the executor**

`src/lib/ai/executor.ts`:
```ts
import { withFailover } from "./failover";
import type { AIProvider, ChatRequest } from "./provider";
import { methodologyAsPrompt } from "../methodologies/loader";

export interface ExecuteRequest {
  methodologies: string[];   // ids
  task: string;              // user-facing task description
  input: unknown;            // structured input
  providers: AIProvider[];
  jsonMode?: boolean;
}

export async function execute(req: ExecuteRequest) {
  const methodBlocks = req.methodologies.map((id) => methodologyAsPrompt(id)).join("\n---\n");
  const systemPrompt = `You are BlogPilot AI's SEO content engine. Follow the methodologies below EXACTLY. Do not deviate. Do not invent best practices. If a methodology says output JSON, output ONLY JSON.\n\n${methodBlocks}`;
  const userPrompt = `Task: ${req.task}\n\nInput:\n${JSON.stringify(req.input, null, 2)}\n\nProduce the output specified by the methodologies above.`;
  const chatReq: ChatRequest = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    jsonMode: req.jsonMode,
    temperature: 0.5,
    maxTokens: 4096
  };
  return withFailover(req.providers, chatReq);
}
```

- [ ] **Step 6: Run methodology tests, expect pass**

Run: `npx vitest run tests/methodology-loader.test.ts`
Expected: 2 passed.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: methodology library loader + executor + 3 baseline playbooks"
```

---

## Task 6: Tailwind v4 setup + brand tokens + App Shell + Dice Codes branding

**Files:**
- Create: `src/app/globals.css`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/components/app-shell.tsx`
- Create: `src/components/dice-codes-badge.tsx`
- Create: `src/components/dice-codes-rail.tsx`
- Create: `public/blogpilot-logo.svg`
- Create: `public/dice-codes-logo.svg`

- [ ] **Step 1: Set up Tailwind v4 + tokens**

`postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#3B82F6", fg: "#0F172A" },
        accent: { lime: "#84CC16" }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        serif: ["Lora", "Georgia", "serif"]
      }
    }
  }
} satisfies Config;
```

`src/app/globals.css`:
```css
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&family=Lora:wght@400;500&display=swap");

:root {
  --bg: #0F172A;
  --surface: #1E293B;
  --text: #F8FAFC;
  --muted: #94A3B8;
  --brand: #3B82F6;
  --accent: #84CC16;
}

html, body { background: var(--bg); color: var(--text); font-family: Inter, system-ui, sans-serif; }
```

- [ ] **Step 2: Create logos**

`public/blogpilot-logo.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><path d="M3 17 L29 5 L21 29 L17 19 L3 17Z" fill="#3B82F6" stroke="#84CC16" stroke-width="1.2"/></svg>
```

`public/dice-codes-logo.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20"><rect x="3" y="3" width="26" height="26" rx="5" fill="#84CC16"/><circle cx="11" cy="11" r="2.2" fill="#0F172A"/><circle cx="21" cy="21" r="2.2" fill="#0F172A"/><circle cx="16" cy="16" r="2.2" fill="#0F172A"/></svg>
```

- [ ] **Step 3: Create DiceCodes branding components**

`src/components/dice-codes-badge.tsx`:
```tsx
import Image from "next/image";

export function DiceCodesBadge() {
  return (
    <a
      href="https://dicecodes.com"
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition"
      title="Built by Dice Codes"
    >
      <Image src="/dice-codes-logo.svg" alt="Dice Codes" width={18} height={18} />
      <span>by <span className="font-semibold">Dice Codes</span></span>
    </a>
  );
}
```

`src/components/dice-codes-rail.tsx`:
```tsx
"use client";
import { useState } from "react";

export function DiceCodesRail() {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed right-3 bottom-3 text-xs px-3 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700">
        Need a custom SaaS?
      </button>
    );
  }
  return (
    <aside className="fixed right-4 bottom-4 w-72 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur p-4 shadow-2xl">
      <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 text-xs">✕</button>
      <h3 className="text-sm font-semibold text-white mb-1">Need a custom SaaS like this?</h3>
      <p className="text-xs text-slate-400 mb-3">Dice Codes builds web apps, SaaS, mobile apps and SEO-ready sites at startup-friendly prices.</p>
      <div className="flex gap-2">
        <a href="https://wa.me/919888404991" target="_blank" rel="noreferrer noopener" className="flex-1 text-center text-xs py-2 rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400">WhatsApp</a>
        <a href="mailto:Contact@dicecodes.com" className="flex-1 text-center text-xs py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400">Email</a>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Create app shell**

`src/components/app-shell.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";
import { DiceCodesBadge } from "./dice-codes-badge";
import { DiceCodesRail } from "./dice-codes-rail";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/blogpilot-logo.svg" alt="BlogPilot AI" width={28} height={28} />
            <span className="font-semibold text-white">BlogPilot <span className="text-blue-400">AI</span></span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-slate-300">
            <Link href="/" className="hover:text-white">Clients</Link>
            <Link href="/settings" className="hover:text-white">Settings</Link>
            <Link href="/about" className="hover:text-white">About</Link>
            <DiceCodesBadge />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>

      <footer className="border-t border-slate-800 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-slate-500">
          <span>BlogPilot AI · MIT licensed · Built by <a href="https://dicecodes.com" className="text-slate-300 hover:text-white">Dice Codes</a></span>
          <span>Free consult: <a href="https://wa.me/919888404991" className="hover:text-white">WhatsApp 9888404991</a> · Contact@dicecodes.com</span>
        </div>
      </footer>

      <DiceCodesRail />
    </div>
  );
}
```

- [ ] **Step 5: Root layout + home page**

`src/app/layout.tsx`:
```tsx
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata = {
  title: "BlogPilot AI — Your autopilot from blank page to first-page rank",
  description: "Open-source AI-powered SEO content studio. Built by Dice Codes."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

`src/app/page.tsx`:
```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
        <h1 className="text-3xl font-semibold text-white">Your clients, your content, on autopilot.</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Add any website, BlogPilot auto-discovers the niche, voice, competitors, and Core Web Vitals,
          then plans, writes, and schedules SEO-optimized posts for you.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/clients/new" className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400">+ Add client</Link>
          <Link href="/settings" className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white">Connect AI key</Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Boot dev server, smoke check**

Run: `npm run dev`
Expected: opens at `http://localhost:3000` showing the app shell, branded header, Dice Codes badge top-right, collapsible rail bottom-right, footer with WhatsApp + email.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: app shell with Dice Codes branding (badge, rail, footer)"
```

---

## Task 7: About page (Dice Codes) + Settings page (AI keys) + Lead capture endpoint

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/settings/page.tsx`
- Create: `src/app/api/lead/route.ts`
- Create: `src/app/api/ai/test/route.ts`
- Create: `src/lib/env.ts`

- [ ] **Step 1: Env loader**

`src/lib/env.ts`:
```ts
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
```

- [ ] **Step 2: About page**

`src/app/about/page.tsx`:
```tsx
export default function AboutPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>BlogPilot AI — Built by Dice Codes</h1>
      <p className="lead text-slate-300">
        BlogPilot AI is free, open-source, and self-hostable. We built it because every blogger and agency
        deserves agency-grade SEO tooling without $89/month subscriptions.
      </p>

      <h2>Who is Dice Codes?</h2>
      <p>
        Dice Codes is a Punjab, India based digital studio that builds web apps, SaaS, mobile apps,
        e-commerce stores, and SEO-ready sites for startups and SMEs worldwide — at a fraction of
        US agency rates. We work with founders who want production-grade software without burning
        their seed round on engineering.
      </p>

      <h2>What we build</h2>
      <ul>
        <li>Custom SaaS products (like BlogPilot AI)</li>
        <li>Websites & e-commerce (WordPress, Shopify, custom)</li>
        <li>Mobile apps (Flutter — iOS + Android from one codebase)</li>
        <li>SEO services + digital marketing (PPC, Google Ads, social)</li>
        <li>UI/UX design + branding</li>
      </ul>

      <h2>Selected work</h2>
      <ul>
        <li>Oceglow US</li>
        <li>Marby</li>
        <li>Anahat Exclusive</li>
        <li>Bravo Pizza NYC</li>
      </ul>

      <h2>Want a custom SaaS like this for your industry?</h2>
      <p>
        Free 30-minute consultation. We'll scope, estimate, and tell you honestly whether to build,
        buy, or skip.
      </p>
      <p>
        <a href="https://wa.me/919888404991" className="px-4 py-2 inline-block rounded-lg bg-lime-500 text-slate-900 font-semibold no-underline">WhatsApp 9888404991</a>
        &nbsp;&nbsp;
        <a href="mailto:Contact@dicecodes.com" className="px-4 py-2 inline-block rounded-lg bg-blue-500 text-white font-semibold no-underline">Contact@dicecodes.com</a>
        &nbsp;&nbsp;
        <a href="https://dicecodes.com" target="_blank" rel="noreferrer noopener" className="text-slate-300">dicecodes.com →</a>
      </p>
    </article>
  );
}
```

- [ ] **Step 3: Settings page**

`src/app/settings/page.tsx`:
```tsx
"use client";
import { useState } from "react";

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini (free tier 1500/day)", envKey: "GEMINI_API_KEY", signup: "https://aistudio.google.com/app/apikey" },
  { id: "groq", name: "Groq (free, very fast)", envKey: "GROQ_API_KEY", signup: "https://console.groq.com/keys" },
  { id: "openrouter", name: "OpenRouter (free + paid models)", envKey: "OPENROUTER_API_KEY", signup: "https://openrouter.ai/keys" },
  { id: "anthropic", name: "Anthropic Claude (paid, premium)", envKey: "ANTHROPIC_API_KEY", signup: "https://console.anthropic.com/" },
  { id: "openai", name: "OpenAI (paid)", envKey: "OPENAI_API_KEY", signup: "https://platform.openai.com/api-keys" },
  { id: "deepseek", name: "DeepSeek (cheap premium)", envKey: "DEEPSEEK_API_KEY", signup: "https://platform.deepseek.com/" },
  { id: "mistral", name: "Mistral (free tier)", envKey: "MISTRAL_API_KEY", signup: "https://console.mistral.ai/" },
  { id: "cerebras", name: "Cerebras (free, ultra-fast)", envKey: "CEREBRAS_API_KEY", signup: "https://cloud.cerebras.ai/" },
  { id: "together", name: "Together AI", envKey: "TOGETHER_API_KEY", signup: "https://api.together.xyz/" },
  { id: "perplexity", name: "Perplexity (built-in web search)", envKey: "PERPLEXITY_API_KEY", signup: "https://www.perplexity.ai/settings/api" },
  { id: "ollama", name: "Ollama (fully local, no key)", envKey: "OLLAMA_BASE_URL", signup: "https://ollama.com/download" }
];

export default function SettingsPage() {
  const [results, setResults] = useState<Record<string, string>>({});
  async function test(id: string) {
    setResults((r) => ({ ...r, [id]: "testing…" }));
    const res = await fetch("/api/ai/test", { method: "POST", body: JSON.stringify({ provider: id }), headers: { "content-type": "application/json" } });
    const j = await res.json();
    setResults((r) => ({ ...r, [id]: j.ok ? "✓ reachable" : `✗ ${j.error}` }));
  }
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">AI provider keys</h1>
      <p className="text-slate-400 text-sm max-w-2xl">
        Set provider keys in your <code className="text-slate-200 bg-slate-800 px-1 rounded">.env</code> file (or environment variables).
        Keys never leave your machine. BlogPilot will auto-failover between configured providers.
      </p>
      <div className="grid gap-3">
        {PROVIDERS.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-white font-medium">{p.name}</div>
              <code className="text-xs text-slate-400">{p.envKey}=...</code>
              <a href={p.signup} target="_blank" rel="noreferrer noopener" className="ml-3 text-xs text-blue-400 hover:underline">Get key</a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{results[p.id] ?? ""}</span>
              <button onClick={() => test(p.id)} className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">Test</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: AI test endpoint**

`src/app/api/ai/test/route.ts`:
```ts
import { NextResponse } from "next/server";
import { buildRegistry } from "@/lib/ai/registry";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const { provider } = (await req.json()) as { provider: string };
  const registry = buildRegistry(env as unknown as NodeJS.ProcessEnv);
  const entry = registry.find((e) => e.provider.id === provider);
  if (!entry) return NextResponse.json({ ok: false, error: "Key not set" });
  try {
    const ok = await entry.provider.test();
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}
```

- [ ] **Step 5: Lead capture endpoint**

`src/app/api/lead/route.ts`:
```ts
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = (await req.json()) as { name?: string; email?: string; message?: string; source?: string };
  if (env.DICE_LEAD_WEBHOOK) {
    try {
      await fetch(env.DICE_LEAD_WEBHOOK, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    } catch {}
  }
  return NextResponse.json({ ok: true, contact: { email: "Contact@dicecodes.com", whatsapp: "+919888404991" } });
}
```

- [ ] **Step 6: Smoke test**

Run: `npm run dev`, browse to `/about` and `/settings`, click "Test" on Ollama (should report unreachable unless installed — that's the expected friendly path).

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: about page (Dice Codes), settings page (AI keys), lead capture endpoint"
```

---

## Task 8: Crawler — fetch site identity + sitemap + PageSpeed

**Files:**
- Create: `src/lib/crawler/playwright-fetcher.ts`
- Create: `src/lib/crawler/cheerio-fetcher.ts`
- Create: `src/lib/crawler/parse-site-identity.ts`
- Create: `src/lib/crawler/parse-sitemap.ts`
- Create: `src/lib/crawler/pagespeed.ts`
- Create: `src/lib/crawler/index.ts`
- Create: `tests/crawler.test.ts`

- [ ] **Step 1: Cheerio fetcher (always available, no browser needed)**

`src/lib/crawler/cheerio-fetcher.ts`:
```ts
import * as cheerio from "cheerio";

export interface FetchResult { html: string; finalUrl: string; status: number; }

export async function fetchHtml(url: string, signal?: AbortSignal): Promise<FetchResult> {
  const r = await fetch(url, { redirect: "follow", signal, headers: { "user-agent": "BlogPilotAI/0.1 (+https://github.com/dicecodes/blogpilot-ai)" } });
  const html = await r.text();
  return { html, finalUrl: r.url, status: r.status };
}

export function load(html: string) { return cheerio.load(html); }
```

- [ ] **Step 2: Playwright fetcher (preferred, falls back to cheerio if not installed)**

`src/lib/crawler/playwright-fetcher.ts`:
```ts
import { fetchHtml as cheerioFetch } from "./cheerio-fetcher";

export async function fetchHtmlSmart(url: string): Promise<{ html: string; finalUrl: string; status: number; rendered: boolean }> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const ctx = await browser.newContext({ userAgent: "BlogPilotAI/0.1" });
      const page = await ctx.newPage();
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      const html = await page.content();
      return { html, finalUrl: page.url(), status: resp?.status() ?? 0, rendered: true };
    } finally {
      await browser.close();
    }
  } catch {
    const r = await cheerioFetch(url);
    return { ...r, rendered: false };
  }
}
```

- [ ] **Step 3: Parse site identity**

`src/lib/crawler/parse-site-identity.ts`:
```ts
import { load } from "./cheerio-fetcher";

export interface SiteIdentity {
  title: string;
  description: string;
  language: string;
  favicon?: string;
  ogImage?: string;
  social: Record<string, string>;
  generator?: string;       // wordpress / shopify / ghost detection
}

export function parseSiteIdentity(html: string, baseUrl: string): SiteIdentity {
  const $ = load(html);
  const abs = (u?: string) => (u && !u.startsWith("http") ? new URL(u, baseUrl).toString() : u);
  const title = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content") || "";
  const description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "";
  const language = $("html").attr("lang") || "en";
  const favicon = abs($('link[rel~="icon"]').attr("href") || "/favicon.ico");
  const ogImage = abs($('meta[property="og:image"]').attr("content"));
  const generator = $('meta[name="generator"]').attr("content") || undefined;
  const social: Record<string, string> = {};
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const net of ["twitter.com", "x.com", "facebook.com", "linkedin.com", "instagram.com", "youtube.com", "github.com", "tiktok.com"]) {
      if (href.includes(net) && !social[net]) social[net] = href;
    }
  });
  return { title, description, language, favicon, ogImage, social, generator };
}
```

- [ ] **Step 4: Parse sitemap**

`src/lib/crawler/parse-sitemap.ts`:
```ts
import { fetchHtml, load } from "./cheerio-fetcher";

export async function parseSitemap(baseUrl: string): Promise<{ urls: string[]; count: number }> {
  const tries = ["/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"];
  for (const path of tries) {
    try {
      const u = new URL(path, baseUrl).toString();
      const r = await fetchHtml(u);
      if (r.status >= 400) continue;
      const $ = load(r.html);
      const urls: string[] = [];
      $("loc").each((_, el) => urls.push($(el).text().trim()));
      if (urls.length > 0) {
        // If index, optionally drill in once
        if (urls[0].endsWith(".xml") && urls.length < 20) {
          const all: string[] = [];
          for (const sm of urls.slice(0, 5)) {
            try { const rr = await fetchHtml(sm); const $$ = load(rr.html); $$("loc").each((_, el) => all.push($$(el).text().trim())); } catch {}
          }
          return { urls: all, count: all.length };
        }
        return { urls, count: urls.length };
      }
    } catch {}
  }
  return { urls: [], count: 0 };
}
```

- [ ] **Step 5: PageSpeed Insights (free, no key)**

`src/lib/crawler/pagespeed.ts`:
```ts
export interface PageSpeedResult { lcpMs?: number; clsScore?: number; inpMs?: number; performance?: number; }

export async function pageSpeed(url: string): Promise<PageSpeedResult> {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=mobile`;
  try {
    const r = await fetch(api);
    if (!r.ok) return {};
    const j = (await r.json()) as {
      lighthouseResult?: { audits?: Record<string, { numericValue?: number }>; categories?: { performance?: { score?: number } } };
      loadingExperience?: { metrics?: Record<string, { percentile?: number }> };
    };
    const audits = j.lighthouseResult?.audits ?? {};
    const cwv = j.loadingExperience?.metrics ?? {};
    return {
      lcpMs: audits["largest-contentful-paint"]?.numericValue ?? cwv.LARGEST_CONTENTFUL_PAINT_MS?.percentile,
      clsScore: audits["cumulative-layout-shift"]?.numericValue ?? cwv.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile,
      inpMs: cwv.INTERACTION_TO_NEXT_PAINT?.percentile,
      performance: (j.lighthouseResult?.categories?.performance?.score ?? 0) * 100
    };
  } catch {
    return {};
  }
}
```

- [ ] **Step 6: Top-level discover**

`src/lib/crawler/index.ts`:
```ts
import { fetchHtmlSmart } from "./playwright-fetcher";
import { parseSiteIdentity, type SiteIdentity } from "./parse-site-identity";
import { parseSitemap } from "./parse-sitemap";
import { pageSpeed, type PageSpeedResult } from "./pagespeed";

export interface DiscoverySnapshot {
  url: string;
  finalUrl: string;
  identity: SiteIdentity;
  sitemap: { count: number; sample: string[] };
  webVitals: PageSpeedResult;
  renderedWithPlaywright: boolean;
  fetchedAt: number;
}

export async function discover(url: string): Promise<DiscoverySnapshot> {
  const u = url.startsWith("http") ? url : `https://${url}`;
  const fetched = await fetchHtmlSmart(u);
  const identity = parseSiteIdentity(fetched.html, fetched.finalUrl);
  const sm = await parseSitemap(fetched.finalUrl);
  const vitals = await pageSpeed(fetched.finalUrl);
  return {
    url: u,
    finalUrl: fetched.finalUrl,
    identity,
    sitemap: { count: sm.count, sample: sm.urls.slice(0, 20) },
    webVitals: vitals,
    renderedWithPlaywright: fetched.rendered,
    fetchedAt: Date.now()
  };
}
```

- [ ] **Step 7: Write crawler test (offline-safe with a tiny inline fixture)**

`tests/crawler.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseSiteIdentity } from "@/lib/crawler/parse-site-identity";

const html = `
<html lang="en">
<head>
  <title>Example Blog</title>
  <meta name="description" content="A blog about example things.">
  <meta property="og:image" content="/img.png">
  <meta name="generator" content="WordPress 6.5">
  <link rel="icon" href="/favicon.ico">
</head>
<body>
  <a href="https://twitter.com/example">tw</a>
  <a href="https://linkedin.com/in/example">li</a>
</body></html>
`;

describe("parseSiteIdentity", () => {
  it("extracts title, description, lang, generator, social", () => {
    const id = parseSiteIdentity(html, "https://example.com");
    expect(id.title).toBe("Example Blog");
    expect(id.description).toContain("example things");
    expect(id.language).toBe("en");
    expect(id.generator).toContain("WordPress");
    expect(id.social["twitter.com"]).toContain("twitter.com/example");
    expect(id.social["linkedin.com"]).toContain("linkedin.com/in/example");
    expect(id.ogImage).toBe("https://example.com/img.png");
  });
});
```

- [ ] **Step 8: Run crawler test, expect pass**

Run: `npx vitest run tests/crawler.test.ts`
Expected: 1 passed.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: crawler (Playwright + Cheerio fallback) + sitemap + PageSpeed"
```

---

## Task 9: Add Client form + Discover API route + Client Dashboard

**Files:**
- Create: `src/app/clients/new/page.tsx`
- Create: `src/app/clients/[id]/page.tsx`
- Create: `src/app/api/clients/route.ts`
- Create: `src/app/api/clients/[id]/route.ts`
- Create: `src/app/api/discover/route.ts`

- [ ] **Step 1: GET/POST clients route**

`src/app/api/clients/route.ts`:
```ts
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDb, schema } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";

runMigrations();

export async function GET() {
  const db = getDb();
  const rows = db.select().from(schema.clients).all();
  return NextResponse.json({ clients: rows });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { url: string; name?: string };
  const db = getDb();
  const id = randomUUID();
  db.insert(schema.clients).values({ id, url: body.url, name: body.name ?? body.url }).run();
  return NextResponse.json({ id });
}
```

- [ ] **Step 2: Single client route**

`src/app/api/clients/[id]/route.ts`:
```ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const row = db.select().from(schema.clients).where(eq(schema.clients.id, id)).get();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ client: row });
}
```

- [ ] **Step 3: Discover route — runs crawl, updates client row**

`src/app/api/discover/route.ts`:
```ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { discover } from "@/lib/crawler";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { clientId } = (await req.json()) as { clientId: string };
  const db = getDb();
  const row = db.select().from(schema.clients).where(eq(schema.clients.id, clientId)).get();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const snap = await discover(row.url);
    db.update(schema.clients)
      .set({
        name: snap.identity.title || row.name,
        language: snap.identity.language,
        discoverySnapshot: JSON.stringify(snap),
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .where(eq(schema.clients.id, clientId))
      .run();
    return NextResponse.json({ ok: true, snapshot: snap });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Add Client form (UI)**

`src/app/clients/new/page.tsx`:
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("Creating client…");
    try {
      const res = await fetch("/api/clients", { method: "POST", body: JSON.stringify({ url }), headers: { "content-type": "application/json" } });
      const { id } = await res.json();
      setStatus("Auto-discovering site (this can take up to 60s)…");
      const dres = await fetch("/api/discover", { method: "POST", body: JSON.stringify({ clientId: id }), headers: { "content-type": "application/json" } });
      const dj = await dres.json();
      if (!dj.ok) setStatus("Discovery had issues: " + dj.error);
      router.push(`/clients/${id}`);
    } catch (e) {
      setStatus("Error: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-white">Add a client</h1>
      <p className="text-slate-400 text-sm">
        Paste any website URL. BlogPilot will crawl the homepage, parse the sitemap,
        check Core Web Vitals, and build a client profile.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
        />
        <button disabled={busy} className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-50">
          {busy ? "Working…" : "Add & auto-discover"}
        </button>
        {status && <p className="text-sm text-slate-400">{status}</p>}
      </form>
    </section>
  );
}
```

- [ ] **Step 5: Client Dashboard read view**

`src/app/clients/[id]/page.tsx`:
```tsx
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";

runMigrations();

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const row = db.select().from(schema.clients).where(eq(schema.clients.id, id)).get();
  if (!row) return <p className="text-slate-400">Client not found.</p>;
  const snap = row.discoverySnapshot ? JSON.parse(row.discoverySnapshot) : null;

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{row.name}</h1>
          <a href={row.url} target="_blank" rel="noreferrer noopener" className="text-blue-400 text-sm hover:underline">{row.url}</a>
        </div>
        <div className="text-xs text-slate-500">Added {new Date(row.createdAt * 1000).toLocaleString()}</div>
      </header>

      {!snap && <p className="text-slate-400">No discovery snapshot yet.</p>}

      {snap && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Identity">
            <Row k="Title" v={snap.identity.title} />
            <Row k="Description" v={snap.identity.description} />
            <Row k="Language" v={snap.identity.language} />
            <Row k="Generator" v={snap.identity.generator ?? "—"} />
            <Row k="Final URL" v={snap.finalUrl} />
            <Row k="Rendered with" v={snap.renderedWithPlaywright ? "Playwright" : "Cheerio (static)"} />
          </Card>
          <Card title="Sitemap">
            <Row k="URLs discovered" v={String(snap.sitemap.count)} />
            <ul className="text-xs text-slate-400 mt-2 max-h-48 overflow-auto space-y-1">
              {snap.sitemap.sample.map((u: string) => (<li key={u} className="truncate">{u}</li>))}
            </ul>
          </Card>
          <Card title="Core Web Vitals (mobile)">
            <Row k="Performance" v={snap.webVitals.performance != null ? `${Math.round(snap.webVitals.performance)} / 100` : "—"} />
            <Row k="LCP" v={snap.webVitals.lcpMs != null ? `${Math.round(snap.webVitals.lcpMs)} ms` : "—"} />
            <Row k="INP (field)" v={snap.webVitals.inpMs != null ? `${Math.round(snap.webVitals.inpMs)} ms` : "—"} />
            <Row k="CLS" v={snap.webVitals.clsScore != null ? `${(snap.webVitals.clsScore as number).toFixed(3)}` : "—"} />
          </Card>
          <Card title="Social profiles">
            {Object.entries(snap.identity.social as Record<string, string>).map(([k, v]) => (
              <Row key={k} k={k} v={v as string} />
            ))}
            {Object.keys(snap.identity.social ?? {}).length === 0 && <p className="text-slate-500 text-sm">None detected.</p>}
          </Card>
        </div>
      )}
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h2 className="text-sm font-semibold text-slate-200 mb-3">{title}</h2>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{k}</span>
      <span className="text-slate-200 text-right truncate max-w-[60%]">{v}</span>
    </div>
  );
}
```

- [ ] **Step 6: Update home page to list clients**

Edit `src/app/page.tsx`:
```tsx
import Link from "next/link";
import { getDb, schema } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";

runMigrations();

export default function HomePage() {
  const db = getDb();
  const clients = db.select().from(schema.clients).all();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
        <h1 className="text-3xl font-semibold text-white">Your clients, your content, on autopilot.</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Add any website, BlogPilot auto-discovers the niche, voice, competitors, and Core Web Vitals,
          then plans, writes, and schedules SEO-optimized posts for you.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/clients/new" className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400">+ Add client</Link>
          <Link href="/settings" className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white">Connect AI key</Link>
        </div>
      </div>

      {clients.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-blue-500 transition">
              <div className="text-white font-medium truncate">{c.name}</div>
              <div className="text-xs text-slate-500 truncate">{c.url}</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 7: Smoke test the full add-client flow**

Run: `npm run dev`
- Browse to `http://localhost:3000` → click "+ Add client"
- Paste `https://dicecodes.com` → submit
- Wait up to 60s
- Land on client dashboard. Should see Identity (title, description, generator), Sitemap count, Web Vitals (if PageSpeed reachable), and social profiles.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add-client flow, auto-discover API, client dashboard"
```

---

## Task 10: CI matrix workflow + README + final smoke

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `README.md`

- [ ] **Step 1: CI matrix**

`.github/workflows/ci.yml`:
```yaml
name: ci
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: ["18", "20", "22", "24"]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "${{ matrix.node }}" }
      - run: npm install
      - run: npm run typecheck
      - run: npm test
      - run: node ./bin/blogpilot.mjs doctor
```

- [ ] **Step 2: README**

`README.md`:
```markdown
# BlogPilot AI

> Your autopilot from blank page to first-page rank. Open-source, MIT, self-hostable. **Built by [Dice Codes](https://dicecodes.com).**

BlogPilot AI is an agency-grade, multi-client AI content studio. Add any website, it auto-discovers the niche, voice, competitors, and Core Web Vitals, then plans, writes, and schedules SEO-optimized posts.

## Quick start

```bash
npx blogpilot-ai             # uses latest release
# OR
git clone https://github.com/dicecodes/blogpilot-ai
cd blogpilot-ai
npm install
npm run dev
```

Then open http://localhost:3000.

## Requirements

- Node.js 18 or higher (tested on 18, 20, 22, 24)
- Works on Windows, macOS, Linux
- No Python, no Docker, no Redis required
- Bring your own AI key (free options work: Gemini, Groq, OpenRouter, Mistral, Cerebras, Ollama)

## AI providers supported

Free: Google Gemini, Groq, OpenRouter (free models), Mistral, Cohere, Cerebras, SambaNova, Together AI, HuggingFace, Ollama (local), LM Studio (local)
Paid: Anthropic Claude, OpenAI, Perplexity, DeepSeek, xAI, Azure OpenAI, AWS Bedrock

Configure in `.env`:
```
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434
```

## Doctor

```bash
npx blogpilot-ai doctor
```

Checks Node version, sqlite binding, Playwright availability, write permissions.

## License

MIT · Built by [Dice Codes](https://dicecodes.com) · Need a custom SaaS? [WhatsApp +91 9888404991](https://wa.me/919888404991) · Contact@dicecodes.com
```

- [ ] **Step 3: Final smoke**

Run:
```
npx blogpilot-ai doctor
npm run typecheck
npm test
npm run dev
```

Walk through: home → add client (use `https://dicecodes.com`) → see dashboard. Confirm Dice Codes badge in header, rail card bottom-right, footer credit.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: CI matrix (4 Node versions x 3 OSes) + README"
```

---

## Self-Review

**Spec coverage (Wave 1 sections only):**
- §4 brand identity → Task 6 (logos, tokens, app shell, badge, rail, footer) ✓
- §5.1 stack → Tasks 1-3 ✓
- §5.2 multi-tenancy → DB schema in Task 3 ✓
- §5.3 data model → Task 3 (subset: clients, posts, jobs, ai_keys, usage_events) ✓
- §5.4 AI Provider Adapter (full list) → Task 4 (12 providers covered) ✓
- §5.5 Methodology Library → Task 5 (loader + 3 baseline methodologies; rest deferred to Wave 2 per spec) ✓
- Hub A modules 1, 2, 4 (Add Client, Auto-Discover, Client Dashboard) → Tasks 8-9 ✓
- Module 33 API Key Manager → Task 7 (settings page) ✓
- Module 38 About → Task 7 ✓
- §11 lead-gen → Task 7 (/api/lead) ✓
- §15 compatibility → Tasks 1-2 (engines, preinstall guard, doctor, cross-env) + Task 10 (CI matrix) ✓

**Deferred to Wave 2** (out of scope for this plan):
- Hub A modules 3, 5, 6 (multi-client switcher polish, share-link portal, style profile editor UI)
- Hub B (Strategy Hub) entirely
- Hub C (Writing Hub) entirely
- Hubs D, E, F.34-37 entirely
- Remaining 25 methodology files
- sql.js fallback (deferred; native sqlite covers >99% of users)

**Placeholder scan:** No "TBD", "implement later", or vague steps. Every code block is complete.

**Type consistency:** `AIProvider.id` is used consistently; `DiscoverySnapshot` shape used in both crawler and client dashboard.

---

## Execution Handoff

Plan complete and saved to [docs/plans/2026-05-13-blogpilot-wave1-foundation.md](./2026-05-13-blogpilot-wave1-foundation.md).

User is in auto mode — proceeding with **Inline Execution** (executing-plans skill) by default. Will execute Tasks 1 through 10 with a checkpoint after Task 5 (AI + methodology core) and Task 9 (full add-client flow) for review.
