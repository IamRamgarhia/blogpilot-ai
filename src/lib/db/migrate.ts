import { migrate } from "drizzle-orm/libsql/migrator";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getDb } from "./index";

let migratedPromise: Promise<void> | null = null;

export function ensureMigrated(): Promise<void> {
  if (migratedPromise) return migratedPromise;
  migratedPromise = (async () => {
    const db = getDb();
    const folder = join(process.cwd(), "drizzle");
    if (!existsSync(folder)) return;
    await migrate(db, { migrationsFolder: folder });
  })().catch((e) => {
    migratedPromise = null;
    throw e;
  });
  return migratedPromise;
}
