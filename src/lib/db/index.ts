import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import * as schema from "./schema";
import { KnownError } from "../errors";

let _db: LibSQLDatabase<typeof schema> | null = null;

export function dbPath(): string {
  return process.env.BLOGPILOT_DB_PATH ?? "./data/blogpilot.db";
}

export function resetDbCacheForTests(): void {
  _db = null;
}

// A real URL scheme (not a Windows drive letter like "C:"). Must be a known scheme.
function isUrlScheme(p: string): boolean {
  return /^(file|libsql|http|https):/i.test(p);
}

function fileUrlForPath(p: string): string {
  if (isUrlScheme(p)) return p;
  if (isAbsolute(p)) {
    // libsql expects file URLs.
    // POSIX absolute: /var/data/x.db   -> file:///var/data/x.db
    // Windows absolute: C:\foo\x.db    -> file:///C:/foo/x.db
    const abs = resolve(p).replace(/\\/g, "/");
    return abs.startsWith("/") ? `file://${abs}` : `file:///${abs}`;
  }
  return `file:${p}`;
}

export function getDb(): LibSQLDatabase<typeof schema> {
  if (_db) return _db;
  const path = dbPath();
  try {
    if (!isUrlScheme(path)) {
      const dir = dirname(path);
      if (dir && dir !== ".") mkdirSync(dir, { recursive: true });
    }
    const client = createClient({ url: fileUrlForPath(path) });
    _db = drizzle(client, { schema });
    return _db;
  } catch (e) {
    throw new KnownError(
      "Database failed to open",
      "Ensure BLOGPILOT_DB_PATH (or ./data/) is writable.",
      e
    );
  }
}

export { schema };
