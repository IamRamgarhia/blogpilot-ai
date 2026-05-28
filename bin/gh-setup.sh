#!/usr/bin/env bash
# Configures the GitHub repository for maximum SEO + discoverability.
# Run AFTER `gh auth login`. Idempotent — safe to re-run.

set -e

REPO="IamRamgarhia/blogpilot-ai"
DESCRIPTION="Open-source AI SEO content studio. Free, self-hosted. Replaces Surfer, Ahrefs, Clearscope, Screaming Frog, AlsoAsked, MarketMuse — one AI key, 39 modules, 45 methodologies, MIT."
HOMEPAGE="https://dicecodes.com"

# 20 GitHub topics — max allowed. Each is a keyword GitHub search indexes.
TOPICS=(
  "seo"
  "ai"
  "content-marketing"
  "seo-tools"
  "ai-content"
  "open-source"
  "self-hosted"
  "nextjs"
  "typescript"
  "blogging"
  "wordpress"
  "ghost"
  "hugo"
  "schema-markup"
  "eeat"
  "ai-overviews"
  "llms-txt"
  "geo"
  "technical-seo"
  "content-strategy"
)

echo "==> Setting repo description + homepage"
gh repo edit "$REPO" \
  --description "$DESCRIPTION" \
  --homepage "$HOMEPAGE" \
  --enable-issues=true \
  --enable-discussions=true \
  --enable-wiki=false \
  --enable-projects=false

echo "==> Setting topics"
gh repo edit "$REPO" $(printf -- "--add-topic %s " "${TOPICS[@]}")

echo "==> Creating v1.0.0 release"
if gh release view v1.0.0 --repo "$REPO" >/dev/null 2>&1; then
  echo "    Release v1.0.0 already exists. Skipping."
else
  gh release create v1.0.0 \
    --repo "$REPO" \
    --title "BlogPilot AI v1.0.0" \
    --notes-file CHANGELOG.md \
    --latest
fi

echo "==> Repo configured for SEO."
echo ""
echo "Still TODO (requires GitHub UI):"
echo "  1. Upload public/og-image.svg as the Social Preview"
echo "     https://github.com/$REPO/settings  →  Social preview  →  Edit"
echo "     (Convert SVG to PNG first if GitHub rejects SVG; any image tool works.)"
echo ""
echo "  2. Pin the repo on your profile"
echo "     https://github.com/IamRamgarhia  →  Customize your pins"
echo ""
echo "  3. Submit to Product Hunt (huge for SEO + traffic)"
echo "     https://www.producthunt.com/posts/new"
