#!/usr/bin/env node
// Creates a desktop shortcut that, when double-clicked, launches the BlogPilot
// dev server on port 44321 and opens the browser.
//
// Idempotent: safe to re-run. Removes a stale shortcut before creating a new one.
//
// Platform behavior:
//   Windows  →  %USERPROFILE%\Desktop\BlogPilot AI.lnk  (via PowerShell COM)
//   macOS    →  ~/Desktop/BlogPilot AI.command          (chmod +x)
//   Linux    →  ~/Desktop/blogpilot-ai.desktop          (chmod +x)
//
// All three invoke: cd <project>; npm run launch

import { execSync } from "node:child_process";
import { existsSync, writeFileSync, chmodSync, rmSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join, resolve } from "node:path";

const PROJECT_DIR = resolve(process.cwd());
const PORT = "44321";

function desktopDir() {
  // Best-effort cross-platform Desktop directory resolution.
  return join(homedir(), "Desktop");
}

function createWindowsShortcut() {
  const desktop = desktopDir();
  if (!existsSync(desktop)) {
    console.log("Skipped: Desktop folder not found at " + desktop);
    return;
  }
  const lnk = join(desktop, "BlogPilot AI.lnk");

  // PowerShell COM API to create a .lnk pointing at a wrapper .bat (so we get a console window).
  const batPath = join(PROJECT_DIR, ".launcher", "blogpilot.bat");
  const batDir = join(PROJECT_DIR, ".launcher");
  if (!existsSync(batDir)) execSync(`mkdir "${batDir}"`, { shell: "cmd.exe", stdio: "ignore" });
  const bat = `@echo off
title BlogPilot AI
cd /d "${PROJECT_DIR}"
set PORT=${PORT}
call npm run launch
pause
`;
  writeFileSync(batPath, bat);

  const ps = `
$s = (New-Object -ComObject WScript.Shell).CreateShortcut("${lnk.replace(/\\/g, "\\\\")}")
$s.TargetPath = "${batPath.replace(/\\/g, "\\\\")}"
$s.WorkingDirectory = "${PROJECT_DIR.replace(/\\/g, "\\\\")}"
$s.WindowStyle = 1
$s.Description = "BlogPilot AI - open-source SEO content studio"
$s.IconLocation = "%SystemRoot%\\System32\\shell32.dll, 13"
$s.Save()
`;
  try {
    execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, "; ")}"`, { stdio: "ignore" });
    console.log("✓ Desktop shortcut created: " + lnk);
  } catch (e) {
    console.error("Could not create Windows .lnk shortcut: " + (e instanceof Error ? e.message : String(e)));
  }
}

function createMacShortcut() {
  const desktop = desktopDir();
  if (!existsSync(desktop)) {
    console.log("Skipped: Desktop folder not found at " + desktop);
    return;
  }
  const cmdFile = join(desktop, "BlogPilot AI.command");
  const script = `#!/usr/bin/env bash
cd "${PROJECT_DIR}"
export PORT=${PORT}
exec npm run launch
`;
  try {
    if (existsSync(cmdFile)) rmSync(cmdFile, { force: true });
    writeFileSync(cmdFile, script);
    chmodSync(cmdFile, 0o755);
    console.log("✓ Desktop shortcut created: " + cmdFile);
  } catch (e) {
    console.error("Could not create .command shortcut: " + (e instanceof Error ? e.message : String(e)));
  }
}

function createLinuxShortcut() {
  const desktop = desktopDir();
  if (!existsSync(desktop)) {
    console.log("Skipped: Desktop folder not found at " + desktop);
    return;
  }
  const file = join(desktop, "blogpilot-ai.desktop");
  const content = `[Desktop Entry]
Type=Application
Name=BlogPilot AI
Comment=Open-source SEO content studio
Exec=bash -c 'cd "${PROJECT_DIR}" && PORT=${PORT} npm run launch; exec bash'
Terminal=true
Categories=Development;Utility;
StartupNotify=false
`;
  try {
    if (existsSync(file)) rmSync(file, { force: true });
    writeFileSync(file, content);
    chmodSync(file, 0o755);
    console.log("✓ Desktop shortcut created: " + file);
    console.log("  Note: on some Linux desktops you may need to right-click → 'Allow launching' the first time.");
  } catch (e) {
    console.error("Could not create .desktop shortcut: " + (e instanceof Error ? e.message : String(e)));
  }
}

const p = platform();
if (p === "win32") createWindowsShortcut();
else if (p === "darwin") createMacShortcut();
else if (p === "linux") createLinuxShortcut();
else console.log("Desktop shortcut not supported on platform: " + p);
