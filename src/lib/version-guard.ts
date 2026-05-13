const MIN_MAJOR = 18;
const MIN_MINOR = 17;

export interface VersionCheck {
  ok: boolean;
  message?: string;
}

export function checkNodeVersion(version: string): VersionCheck {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!m) {
    return { ok: false, message: `Cannot parse Node version: ${version}` };
  }
  const major = Number(m[1]);
  const minor = Number(m[2]);
  if (major < MIN_MAJOR || (major === MIN_MAJOR && minor < MIN_MINOR)) {
    return {
      ok: false,
      message: `BlogPilot AI requires Node ${MIN_MAJOR}.${MIN_MINOR} or higher. You have ${version}. Upgrade: https://nodejs.org/`
    };
  }
  return { ok: true };
}
