#!/usr/bin/env node
// One-shot post-install setup: ensure migrations exist, .env exists, data/ dir exists.
import { existsSync, copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const log = (m) => console.log(m);

log("BlogPilot AI — setup");

// 1. Ensure data dir
if (!existsSync("data")) {
  mkdirSync("data", { recursive: true });
  log("created data/");
}

// 2. Ensure .env
if (!existsSync(".env") && !existsSync(".env.local")) {
  if (existsSync(".env.example")) {
    copyFileSync(".env.example", ".env");
    log("copied .env.example -> .env  (edit it to add at least one AI provider key)");
  } else {
    log("no .env.example found; skipping .env copy");
  }
}

// 3. Ensure migrations
const hasMigration = existsSync("drizzle") && readdirSync("drizzle").some((f) => f.endsWith(".sql"));
if (!hasMigration) {
  log("generating database migrations...");
  execSync("npx drizzle-kit generate", { stdio: "inherit" });
}

log("\nSetup complete. Next: npm run dev");
