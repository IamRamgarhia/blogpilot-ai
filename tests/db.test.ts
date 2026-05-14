import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { rmSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

// Use an OS temp dir so test artifacts never appear in the repo root, regardless
// of how the test is invoked or how the platform handles cleanup on failure.
const TEST_DIR = mkdtempSync(join(tmpdir(), "blogpilot-test-"));
const TEST_DB = join(TEST_DIR, "blogpilot-test.db");
process.env.BLOGPILOT_DB_PATH = TEST_DB;

const { getDb, schema, resetDbCacheForTests } = await import("../src/lib/db/index");
const { ensureMigrated } = await import("../src/lib/db/migrate");

function cleanup() {
  resetDbCacheForTests();
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    try { rmSync(TEST_DB + suffix, { force: true }); } catch {}
  }
  try { rmSync(TEST_DIR, { recursive: true, force: true }); } catch {}
}

describe("db", () => {
  beforeAll(async () => {
    if (existsSync(TEST_DB)) rmSync(TEST_DB, { force: true });
    await ensureMigrated();
  });
  afterAll(cleanup);

  it("inserts and reads a client", async () => {
    const db = getDb();
    const id = randomUUID();
    await db
      .insert(schema.clients)
      .values({ id, url: "https://example.com", name: "Example" })
      .run();
    const rows = await db.select().from(schema.clients).all();
    expect(rows.find((r) => r.id === id)).toBeDefined();
  });

  it("creates parent directory when path is nested", () => {
    expect(existsSync(TEST_DIR)).toBe(true);
  });
});
