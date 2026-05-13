import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { rmSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

const TEST_DB = "./test-blogpilot.db";
process.env.BLOGPILOT_DB_PATH = TEST_DB;

const { getDb, schema } = await import("../src/lib/db/index");
const { ensureMigrated } = await import("../src/lib/db/migrate");

describe("db", () => {
  beforeAll(async () => {
    if (existsSync(TEST_DB)) rmSync(TEST_DB);
    await ensureMigrated();
  });
  afterAll(() => {
    try { rmSync(TEST_DB); } catch {}
    try { rmSync(TEST_DB + "-journal"); } catch {}
    try { rmSync(TEST_DB + "-wal"); } catch {}
    try { rmSync(TEST_DB + "-shm"); } catch {}
  });

  it("inserts and reads a client", async () => {
    const db = getDb();
    const id = randomUUID();
    await db.insert(schema.clients).values({ id, url: "https://example.com", name: "Example" }).run();
    const rows = await db.select().from(schema.clients).all();
    expect(rows.find((r) => r.id === id)).toBeDefined();
  });
});
