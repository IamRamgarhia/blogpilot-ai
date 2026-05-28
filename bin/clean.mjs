#!/usr/bin/env node
// Wipe everything the app + dev workflow generates.
import { rmSync, existsSync } from "node:fs";

const targets = [
  ".next",
  "out",
  "data",
  ".launcher",
  "tsconfig.tsbuildinfo",
  ".tsbuildinfo",
  "test-results",
  "playwright-report",
  ".playwright",
  "blogpilot.db",
  "blogpilot.db-journal",
  "blogpilot.db-wal",
  "blogpilot.db-shm",
  "test-blogpilot.db",
  "test-blogpilot.db-journal",
  "test-blogpilot.db-wal",
  "test-blogpilot.db-shm"
];

let removed = 0;
for (const t of targets) {
  if (existsSync(t)) {
    try {
      rmSync(t, { recursive: true, force: true });
      console.log("removed", t);
      removed++;
    } catch (e) {
      console.error("could not remove", t, "—", String(e));
    }
  }
}
console.log(`\nCleaned ${removed} item(s). Run "npm install && npm run setup" to start fresh.`);
