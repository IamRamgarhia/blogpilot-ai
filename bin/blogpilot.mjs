#!/usr/bin/env node
import { existsSync, accessSync, constants } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const cmd = process.argv[2] ?? "help";

const MIN_MAJOR = 18;
const MIN_MINOR = 17;

function checkNodeVersion(version) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!m) return { ok: false, message: `Cannot parse Node version: ${version}` };
  const major = Number(m[1]);
  const minor = Number(m[2]);
  if (major < MIN_MAJOR || (major === MIN_MAJOR && minor < MIN_MINOR)) {
    return {
      ok: false,
      message: `Need Node ${MIN_MAJOR}.${MIN_MINOR}+. You have ${version}. Upgrade: https://nodejs.org/`
    };
  }
  return { ok: true };
}

function row(label, ok, detail = "") {
  const icon = ok ? "OK " : "FAIL";
  const color = ok ? "\x1b[32m" : "\x1b[31m";
  console.log(`${color}${icon}\x1b[0m  ${label}${detail ? "  -  " + detail : ""}`);
  return ok;
}

async function doctor() {
  console.log("\nBlogPilot AI Doctor\n");
  let allOk = true;

  const node = checkNodeVersion(process.versions.node);
  allOk = row(`Node ${process.versions.node}`, node.ok, node.message ?? "") && allOk;

  let sqliteOk = false;
  try { await import("@libsql/client"); sqliteOk = true; } catch {}
  row("@libsql/client", sqliteOk, sqliteOk ? "" : "run npm install");

  let playwrightOk = false;
  try { await import("playwright"); playwrightOk = true; } catch {}
  row("playwright", playwrightOk, playwrightOk ? "" : "will use Cheerio static fallback");

  const cwd = process.cwd();
  let writeOk = true;
  try { accessSync(cwd, constants.W_OK); } catch { writeOk = false; }
  allOk = row(`Write access to ${cwd}`, writeOk) && allOk;

  if (allOk) {
    console.log("\n\x1b[32mAll critical checks passed.\x1b[0m\n");
  } else {
    console.log("\n\x1b[31mSome checks failed. See above.\x1b[0m\n");
  }
  process.exit(allOk ? 0 : 1);
}

if (cmd === "doctor") {
  await doctor();
} else if (cmd === "help" || cmd === "--help" || cmd === "-h") {
  console.log("blogpilot-ai <command>\n\n  doctor   Run environment health checks\n  dev      Start dev server (use: npm run dev)\n  help     Show this message\n");
} else {
  console.error(`Unknown command: ${cmd}`);
  console.error("Run 'blogpilot-ai help' for usage.");
  process.exit(1);
}
