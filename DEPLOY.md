# Deploying BlogPilot AI

Three supported deployment paths. Pick whichever fits your setup.

---

## 1. Local (recommended for single-user)

Zero infrastructure. Runs on your laptop. SQLite file lives in the project directory.

```bash
git clone <repo-url>
cd blogpilot-ai
npm install
npx drizzle-kit generate    # one-time
cp .env.example .env        # fill in at least one AI provider key
npm run dev
```

Open http://localhost:3000.

Production build:

```bash
npm run build
npm run start
```

Health check:

```bash
npm run doctor
```

---

## 2. Vercel (free tier works)

BlogPilot is a vanilla Next.js 15 app. Deploy in one click.

1. Push the project to a GitHub/GitLab/Bitbucket repo.
2. Import the repo in Vercel.
3. Vercel auto-detects Next.js. No build settings to change.
4. **Add environment variables in the Vercel dashboard** — at minimum one of `GEMINI_API_KEY`, `GROQ_API_KEY`, `ANTHROPIC_API_KEY`, etc. (See `.env.example`.)
5. After first deploy, run the migration once locally or paste the contents of `drizzle/0000_*.sql` into a one-time SQL setup. (Vercel's filesystem is ephemeral; for persistent data you'll want option 3 below or a hosted libSQL/Turso database.)

For persistent storage on Vercel, use [Turso](https://turso.tech) (managed libSQL) — it's the same client we already use locally. Set `BLOGPILOT_DB_PATH=libsql://<your-db>.turso.io` and add `TURSO_AUTH_TOKEN` (we'll need a 5-line addition to `src/lib/db/index.ts` to pass the auth token when the URL starts with `libsql://`).

---

## 3. Docker (any VPS)

```dockerfile
# Save as Dockerfile in the project root
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx drizzle-kit generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Build + run:

```bash
docker build -t blogpilot-ai .
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your-key \
  -e BLOGPILOT_DB_PATH=/data/blogpilot.db \
  -v $(pwd)/data:/data \
  blogpilot-ai
```

---

## Cross-version safety

BlogPilot supports **Node 18, 20, 22, and 24** on **Windows, macOS, and Linux**. The CI matrix at `.github/workflows/ci.yml` runs all 12 combinations.

Key compatibility decisions:
- Database: `@libsql/client` (prebuilt napi-rs binaries for every Node version)
- Crawler: Playwright with Cheerio fallback for environments where the browser can't be installed
- All paths use `path.join` — no hardcoded slashes
- `cross-env` wraps env-var setting in npm scripts

Run `npm run doctor` to verify your environment.

---

## Production checklist

- [ ] At least one AI provider key set (`GEMINI_API_KEY` for free quota)
- [ ] Database migration applied (`npx drizzle-kit generate` then start the app once)
- [ ] HTTPS terminated at the reverse proxy (Vercel/Cloudflare/nginx)
- [ ] If exposing publicly, consider auth — currently single-user / local-trust model. Cloud + auth is in the spec as a future wave.
- [ ] Set `DICE_LEAD_WEBHOOK` if you want inbound interest forwarded to your Slack / email
- [ ] `npm run doctor` returns all green

---

Built by [Dice Codes](https://dicecodes.com) — need a custom SaaS like this? [WhatsApp +91 9888404991](https://wa.me/919888404991) · Contact@dicecodes.com
