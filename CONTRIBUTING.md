# Contributing to BlogPilot AI

Thanks for considering a contribution.

## Quick rules

- **Be kind.** No hostile comments. We code together.
- **Match the existing style.** Run `npm run typecheck` and `npm test` before submitting.
- **Small focused PRs win.** One feature or one fix per PR. Easier to review, faster to merge.
- **Don't break the cross-version contract.** BlogPilot must keep running on Node 18, 20, 22, 24 across Windows / macOS / Linux. CI will catch regressions.

## Setup

```bash
git clone https://github.com/dicecodes/blogpilot-ai
cd blogpilot-ai
./install.sh          # macOS / Linux
# OR
.\install.ps1         # Windows
```

## Running tests

```bash
npm test                      # all unit tests
npm run typecheck             # TypeScript
BLOGPILOT_E2E=1 npm test      # incl. Playwright e2e (needs dev server running)
```

## Adding a new methodology

The Methodology Library is the heart of BlogPilot. To add one:

1. Create `src/lib/methodologies/<your-id>.md` with frontmatter:
   ```yaml
   ---
   id: your-id
   title: Human-friendly title
   when: When this methodology applies
   inputs: what you pass in
   outputs: what comes out
   source: cite a reputable source
   ---
   ```
2. Write the body — concrete, prescriptive rules. No vague "consider X". Tell the AI exactly what to do.
3. If it returns JSON, document the JSON shape inside the methodology.
4. Reference the methodology id from a generator in `src/lib/seo/` or `src/lib/measurement/`.

## Adding a new AI provider

1. Create `src/lib/ai/providers/<provider-name>.ts` implementing the `AIProvider` interface.
2. If the provider is OpenAI-compatible, just add a preset to `src/lib/ai/providers/openai-compat.ts`.
3. Register it in `src/lib/ai/registry.ts` with an appropriate priority.
4. Add a row to the Settings page provider list.
5. Update the README and `.env.example`.

## Adding a new CMS exporter

1. Create `src/lib/exports/<platform>.ts` exporting a `build<Platform>(posts: ExportPost[]): string` function.
2. Wire it into `/api/export-cms/[postId]/route.ts` under a new `platform` value.
3. Add a download button on the Distribute page.
4. Write a unit test in `tests/cms-exports.test.ts`.

## Reporting bugs

Open an issue with:
- Node version (`node -v`)
- OS + version
- Reproduction steps
- Expected vs actual behavior
- Output of `npm run doctor`

## License

By contributing you agree your contributions are licensed under MIT.
