#!/usr/bin/env node
// One-shot post-install setup. Idempotent.
//
//   1. Create ./data/
//   2. Copy .env.example -> .env (if missing)
//   3. Generate migrations (if missing)
//   4. Create a desktop shortcut that auto-launches the server + opens the browser
//
import { existsSync, copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const log = (m) => console.log(m);

log("BlogPilot AI — setup");

// 1. Ensure data dir
if (!existsSync("data")) {
  mkdirSync("data", { recursive: true });
  log("✓ created ./data/");
}

// 2. Ensure .env
if (!existsSync(".env") && !existsSync(".env.local")) {
  if (existsSync(".env.example")) {
    copyFileSync(".env.example", ".env");
    log("✓ copied .env.example → .env  (edit to add at least one AI provider key)");
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
log("✓ migrations ready");

// 4. Desktop shortcut
const skipShortcut = process.env.BLOGPILOT_SKIP_DESKTOP === "1";
if (!skipShortcut) {
  try {
    execSync("node ./bin/desktop-shortcut.mjs", { stdio: "inherit" });
  } catch {
    log("(desktop shortcut creation failed — non-fatal)");
  }
}

log("");
log("\x1b[32mSetup complete.\x1b[0m");
log("");
log("Run BlogPilot AI:");
log("  • Double-click the \x1b[36m\"BlogPilot AI\"\x1b[0m shortcut on your Desktop");
log("  • OR run \x1b[36mnpm run launch\x1b[0m  (auto-opens http://localhost:44321)");
log("");
log("Stop it:");
log("  • \x1b[36mnpm run stop\x1b[0m");
