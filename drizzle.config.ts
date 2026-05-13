import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: process.env.BLOGPILOT_DB_PATH ?? "./blogpilot.db" }
} satisfies Config;
