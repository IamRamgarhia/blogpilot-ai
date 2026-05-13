// End-to-end smoke against a running dev server. Run with:
//   1) Start dev server: `npm run dev` (port 3000 or whatever is free)
//   2) `BLOGPILOT_E2E_BASE=http://localhost:3002 npx vitest run tests/e2e`
//
// Uses Playwright's core API directly (not @playwright/test) so we stay on a single test runner.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { chromium, type Browser, type Page } from "playwright";

const BASE = process.env.BLOGPILOT_E2E_BASE ?? "http://localhost:3002";
const RUN_E2E = process.env.BLOGPILOT_E2E === "1";

const maybe = RUN_E2E ? describe : describe.skip;

maybe("BlogPilot AI — full flow e2e", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  }, 60_000);

  afterAll(async () => {
    await browser?.close();
  });

  it("home page renders with Dice Codes branding", async () => {
    await page.goto(BASE);
    const text = (await page.locator("body").textContent()) ?? "";
    expect(text).toContain("BlogPilot");
    expect(text).toContain("Dice Codes");
  }, 30_000);

  it("about page lists Dice Codes services", async () => {
    await page.goto(`${BASE}/about`);
    const text = (await page.locator("body").textContent()) ?? "";
    expect(text).toContain("Dice Codes");
    expect(text).toContain("WhatsApp");
  }, 30_000);

  it("settings page lists at least 10 AI providers", async () => {
    await page.goto(`${BASE}/settings`);
    const items = await page.locator("text=/_API_KEY=|_BASE_URL=/").count();
    expect(items).toBeGreaterThanOrEqual(10);
  }, 30_000);
});
