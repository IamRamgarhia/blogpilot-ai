## What does this PR do?

<!-- One or two sentences. -->

## How to test

```
<!-- Commands or steps a reviewer can run to verify. -->
```

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (99 tests minimum)
- [ ] If touching DB schema, ran `npx drizzle-kit generate` and committed the migration
- [ ] If adding a methodology, the markdown file has complete frontmatter
- [ ] If adding an AI provider, registered it in `registry.ts` and updated `.env.example`
- [ ] Documentation updated (README / DEPLOY / methodology source link)
- [ ] No breaking changes for Node 18+ on Windows / macOS / Linux

## Screenshots (UI changes only)
