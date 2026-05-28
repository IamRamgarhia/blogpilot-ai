#!/usr/bin/env node
// One-click launcher. Starts the dev server, waits for it to be ready,
// then opens the browser. Cross-platform. Default port 44321 (IANA-unassigned,
// chosen to avoid collisions with any other software).
import { spawn, execSync } from "node:child_process";
import http from "node:http";

const PORT = process.env.PORT ?? "44321";
const URL = `http://localhost:${PORT}`;

console.log("");
console.log("\x1b[34mBlogPilot AI\x1b[0m  Starting on \x1b[32m" + URL + "\x1b[0m");
console.log("");

const child = spawn("npm", ["run", "dev:server"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, PORT }
});

let opened = false;
function openBrowser() {
  if (opened) return;
  opened = true;
  const cmd =
    process.platform === "win32" ? `start "" "${URL}"` :
    process.platform === "darwin" ? `open "${URL}"` :
    `xdg-open "${URL}"`;
  try {
    execSync(cmd, { stdio: "ignore" });
    console.log("\n\x1b[32m✓\x1b[0m  Browser opened at " + URL + "\n");
  } catch {
    console.log("\n\x1b[33m!\x1b[0m  Could not auto-open browser. Visit " + URL + " manually.\n");
  }
}

function ping(attempt = 0) {
  if (opened || attempt > 60) return;
  const req = http.get(URL, { timeout: 1500 }, (res) => {
    res.resume();
    if (res.statusCode && res.statusCode < 500) openBrowser();
    else setTimeout(() => ping(attempt + 1), 1000);
  });
  req.on("error", () => setTimeout(() => ping(attempt + 1), 1000));
  req.on("timeout", () => { req.destroy(); setTimeout(() => ping(attempt + 1), 1000); });
}

setTimeout(() => ping(), 2500);

function shutdown() {
  console.log("\n\x1b[34mBlogPilot AI\x1b[0m  Shutting down…");
  if (child && !child.killed) {
    if (process.platform === "win32") {
      try { execSync(`taskkill /PID ${child.pid} /F /T`, { stdio: "ignore" }); } catch {}
    } else {
      child.kill("SIGTERM");
    }
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
child.on("exit", (code) => process.exit(code ?? 0));
