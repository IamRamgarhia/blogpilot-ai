#!/usr/bin/env node
// Cross-platform: kill any process listening on the given port (default 3000).
import { execSync } from "node:child_process";

const port = Number(process.env.PORT ?? 3000);

function killWindows() {
  try {
    const out = execSync(`netstat -ano -p TCP | findstr LISTENING | findstr :${port}`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    }
    if (pids.size === 0) {
      console.log(`No process listening on port ${port}.`);
      return;
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
      } catch {
        console.error(`Could not kill PID ${pid}`);
      }
    }
  } catch {
    console.log(`No process listening on port ${port}.`);
  }
}

function killUnix() {
  try {
    const out = execSync(`lsof -ti :${port}`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    }).trim();
    if (!out) {
      console.log(`No process listening on port ${port}.`);
      return;
    }
    const pids = out.split(/\s+/).filter(Boolean);
    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
        console.log(`Killed PID ${pid}.`);
      } catch (e) {
        console.error(`Could not kill PID ${pid}: ${String(e)}`);
      }
    }
  } catch {
    console.log(`No process listening on port ${port}.`);
  }
}

if (process.platform === "win32") killWindows();
else killUnix();
