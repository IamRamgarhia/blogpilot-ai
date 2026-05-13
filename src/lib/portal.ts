import { randomBytes } from "node:crypto";

export function newShareToken(): string {
  // URL-safe 32-char token. ~190 bits of entropy.
  return randomBytes(24).toString("base64url");
}

export function isExpired(expiresAt: number | null | undefined): boolean {
  if (!expiresAt) return false;
  return Date.now() / 1000 > expiresAt;
}

export function defaultExpiry(days = 30): number {
  return Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
}
