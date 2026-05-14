# BlogPilot AI — Stability & Cleanliness Audit Prompt

> Use this as the systematic checklist for every release. It enumerates the scenarios that have historically caused bugs in AI-content tools, and the cleanliness rules a fresh clone must satisfy.

**Goal:** Verify the project is production-quality across six axes — Install, Start, Runtime, Error Handling, Security, and Cleanliness. After running every scenario, the working tree must remain clean and every test must pass.

---

## Phase 1 — Install scenarios

Run each on a fresh clone (or simulate via `git clean -xfd && git checkout .`).

1. **Cold install on Node 18.17 (minimum)** — `./install.sh` succeeds; no native compilation.
2. **Cold install on Node 22 (LTS)** — same.
3. **Cold install on Node 24 (latest)** — same. No node-gyp errors.
4. **Cold install on Windows PowerShell 5.1** — `.\install.ps1` succeeds, no Unix-only syntax.
5. **npm install with no internet** — fails fast with clear message; no half-installed state.
6. **`npm install` re-run on top of existing install** — idempotent, no duplicate files.
7. **Yarn / pnpm / bun installs** — all complete (lockfile only committed for npm but others should still resolve).
8. **Fresh user with Node 16 installed** — `preinstall` hook blocks with a clear upgrade message.
9. **CI matrix run** — `.github/workflows/ci.yml` covers Node 18/20/22/24 × Ubuntu/macOS/Windows.

---

## Phase 2 — Start scenarios

After install, the first `npm run dev` should succeed without any extra step.

1. **First run, no `.env` file** — installer copies `.env.example` → `.env` automatically. App still boots and shows a "no AI provider configured" message in Settings.
2. **First run with `.env` containing only `GEMINI_API_KEY`** — boots, Gemini works, settings page shows it as enabled.
3. **First run with `.env` containing only `OLLAMA_BASE_URL`** — boots, no error if Ollama is unreachable; fallback chain reports it down.
4. **Port 3000 already in use** — dev server auto-picks 3001+. Helpful log message.
5. **Database missing** — first call to `ensureMigrated()` creates it.
6. **Database WAL file locked from previous crashed run** — recovers automatically (libsql handles this).
7. **`npm run stop` while server is running** — kills it cleanly. Re-run is a no-op with friendly message.

---

## Phase 3 — Runtime scenarios

### Onboarding & crawler

1. **Add client URL without `https://`** — normalizer prepends scheme.
2. **Add client URL that 404s** — graceful error message; client still saved so user can retry discovery.
3. **Add client URL that redirects 5 times** — follows redirects; finalUrl reflects the actual landing.
4. **Add client URL with JS-rendered content but Playwright not installed** — Cheerio fallback emits a warning, still completes.
5. **Add client URL with no sitemap** — sitemap.count is 0, dashboard shows "—".
6. **Add client URL with sitemap index pointing to 100 sub-sitemaps** — drills in only top 5 (cost cap).
7. **PageSpeed Insights API rate-limited** — webVitals returns empty object, no crash.

### Keyword research

1. **Empty seed** — returns 400.
2. **Seed with Unicode characters** — encodes URL correctly, returns suggestions.
3. **Bing SERP returns 403 (bot detected)** — falls back to DDG.
4. **PAA scraping returns 0 items** — fields are empty arrays, not undefined.

### AI calls

1. **No provider keys set** — all generators fall back to deterministic rule-based output, never throw.
2. **First provider returns 429 (rate limit)** — failover to next.
3. **All providers down** — generators fall back to deterministic; user sees a banner explaining "fallback mode".
4. **Provider returns malformed JSON** — JSON.parse wrapped in try/catch, falls back.
5. **Provider returns Markdown when JSON expected** — extractor slices `{...}` substring; if still invalid, fallback.
6. **AI methodology referenced but file missing** — loader throws clear error, surfaces in API response.
7. **AI generates output exceeding maxTokens** — truncated cleanly, no half-JSON exception.

### CMS exports

1. **Post with no draft** — export endpoint returns 404 with clear message.
2. **Title containing `<`, `&`, quotes** — XML/CSV escapers handle correctly. Verified by test.
3. **Markdown containing nested triple-backticks** — exporters don't crash; rendered as-is.
4. **WordPress XML import into a fresh WP install** — round-trips title, slug, status=draft, Yoast meta.

### Schedule + Distribute

1. **Schedule with 100 pending posts** — completes in <2s (deterministic).
2. **Schedule with no posts** — empty list, no crash.
3. **Share-link expiry past current time** — public portal returns "no longer active" page (not 500).
4. **Share-link revoked** — same outcome.

### Measurement

1. **GSC CSV with BOM marker** — header parser strips BOM.
2. **GSC CSV with European decimal separator** — parser handles `,` decimals OR rejects with clear message.
3. **GA4 CSV with empty page-path rows** — those rows are rejected, count reported.
4. **Decay monitor with < 8 weeks of data** — no false alerts; needs minimum sample size.
5. **Recommender with no rank data** — still returns items based on backlog + gaps.

### Internationalization

1. **Hreflang variant with `EN_US`** — flagged as invalid BCP 47.
2. **Hreflang set without x-default** — produces warning, not error.
3. **Hreflang `x-default` listed twice** — error.
4. **llms.txt for client with no posts** — generates with empty Blog section omitted.

---

## Phase 4 — Error handling

1. **Every API route handles invalid JSON body** — returns 400, not 500.
2. **Every API route handles missing required field** — returns 400.
3. **Every API route handles non-existent clientId/postId** — returns 404, not 500.
4. **Every page handles its parent resource missing** — shows friendly "not found" state.
5. **All errors caught at API boundary** — never leak stack traces in JSON response. Only `KnownError.fix` text is surfaced.

---

## Phase 5 — Security

1. **Share-link token entropy** — ≥160 bits, base64url-encoded, single-use revocation supported.
2. **No client-side leak of API keys** — none of the API responses include raw provider keys.
3. **SSRF guard on crawler** — discover route rejects URLs to `localhost`, `127.0.0.1`, `169.254.*` (link-local), `10.*`, `192.168.*`, `0.0.0.0`. *(Currently missing — must add.)*
4. **SSRF guard on rank-tracker** — same.
5. **SSRF guard on refresher** — same.
6. **XSS in client name / post title rendering** — React handles by default; verify no `dangerouslySetInnerHTML` with raw user input.
7. **SQL injection** — Drizzle uses parameterized queries throughout; verify no raw string concatenation in any `.execute()` call.
8. **CSV injection** — exporters prefix cells starting with `=`, `+`, `-`, `@` with `'` to prevent formula injection. *(Currently missing — must add.)*
9. **Path traversal on export filename** — slug is sanitized to `[a-z0-9-]` only.
10. **Rate-limit DOS** — rank-tracker has 5s global throttle; verify other scraper endpoints (research, gap-analyze, competitor-scan, refresh) at least throttle per-process to avoid being banned by Bing.

---

## Phase 6 — Cleanliness (the user's stated priority)

**After `./install.sh` + `npm run dev` + `npm test` + `Ctrl+C`, the working tree must be clean:**

1. **No `*.db*` files in repo root** — production DB lives in `./data/blogpilot.db` (created by app), test DB lives in `./data/test-blogpilot.db` (or temp dir).
2. **`tests/db.test.ts` always cleans up** — even when previous run left a locked WAL.
3. **No `tsconfig.tsbuildinfo`** — already gitignored.
4. **No `.next/` cached files leaking into PRs** — gitignored.
5. **No `playwright-report/` or `test-results/`** — gitignored.
6. **`npm run clean` script** — single command wipes all generated state (`.next`, `data/*.db*`, `tsconfig.tsbuildinfo`).
7. **`.gitignore` covers every generated location** — verified by `git status` on a fresh dev+test cycle.
8. **Installer is idempotent** — running twice produces no churn.
9. **First-launch flow is one command** — after `./install.sh` the user runs `./start.sh` (or `npm run dev`) and lands on the home page. No "now run drizzle-kit generate, then…" steps.
10. **README's Quick Start matches reality** — every command in README works as written.

---

## Phase 7 — Performance

1. **Cold start `npm run dev`** — first home page render < 5s on Node 22 + modest hardware.
2. **Page navigation** — subsequent route changes < 500ms (Next.js dev mode).
3. **Crawler discover** — completes < 60s on a typical 50-post site.
4. **Rank check** — < 10s per keyword including throttle.
5. **Schedule generation for 100 posts** — < 1s.
6. **No memory leak** — Playwright browser instances always closed in `finally` blocks.

---

## Pass criteria

Every scenario must produce one of:
- **Pass** — works as expected.
- **Graceful degrade** — fails safely with clear user-facing message.
- **N/A** — scenario doesn't apply.

A "Fail" anywhere blocks release.

After the full audit: `git status` must be `nothing to commit, working tree clean`, ignoring `.next/` and `data/`.

---

## How to run this audit

1. Read this file.
2. For each scenario, attempt to reproduce.
3. For each bug found, fix it and add a regression test.
4. Re-run `npm test` + `npx tsc --noEmit` until 100% green.
5. Commit the fix with `audit:` prefix.
6. Update this document if new scenarios surface.
