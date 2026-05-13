import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { KnownError } from "../errors";

let _db: LibSQLDatabase<typeof schema> | null = null;

export function getDb(): LibSQLDatabase<typeof schema> {
  if (_db) return _db;
  const path = process.env.BLOGPILOT_DB_PATH ?? "./blogpilot.db";
  try {
    const client = createClient({ url: `file:${path}` });
    _db = drizzle(client, { schema });
    return _db;
  } catch (e) {
    throw new KnownError(
      "Database failed to open",
      "Ensure BLOGPILOT_DB_PATH (or the current directory) is writable.",
      e
    );
  }
}

export { schema };
