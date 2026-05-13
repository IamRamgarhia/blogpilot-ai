---
id: social-repurposing
title: Social Repurposing
when: Repurposing a published post for social platforms
inputs: post title, primary keyword, intro paragraph, TL;DR bullets, conclusion CTA, brand voice profile
outputs: per-platform variants (X thread, LinkedIn, Instagram, Pinterest, WhatsApp)
source: Buffer + Hootsuite content engagement studies + LinkedIn Algorithm 2025 patterns
---

# Social Repurposing

Repurpose, do not summarize. Each platform needs a native voice.

## X / Twitter (thread, 5-8 tweets)

- **Tweet 1 (hook):** counter-intuitive claim, specific number, or contrarian take. NEVER "Just published a new blog post:".
- **Tweets 2-7 (insights):** one insight each. Lead with the punchline. Use line breaks to slow the scroll.
- **Final tweet:** soft CTA + link to the post. "Full breakdown:" then URL.
- 280 chars per tweet. Plain text. No more than 2 hashtags total in the thread.

## LinkedIn (single post, 1300-2000 chars)

- **First line is the hook.** Stops the scroll in the feed. NO "I'm excited to share..."
- **Three line breaks after the hook** push the rest below the "see more" fold.
- **Story or framework in the body.** Concrete. Specific numbers preferred.
- **CTA at the end.** Question to drive comments. Link in first comment, not in the post body (LinkedIn penalizes external links).

## Instagram (caption)

- **First line hooks** before "...more" truncation.
- **Use line breaks** generously. Walls of text die.
- **5-10 hashtags** at the bottom in a separate section. Mix niche + medium-traffic, avoid mega-tags.

## Pinterest (pin description)

- **Keyword-loaded but readable.** Pinterest is a search engine.
- **150-300 chars.** Call out the value: "Get the full guide".
- **3-5 hashtags** at the end.

## WhatsApp / Telegram broadcast

- **One paragraph.** Conversational. Like sending to a friend.
- **Direct link** at the end.
- **No hashtags.** No emojis unless brand voice uses them.

## Output JSON

```json
{
  "x_thread": ["tweet1", "tweet2", "..."],
  "linkedin": "full post text",
  "instagram": "caption text\n\n#hashtag1 #hashtag2",
  "pinterest": "description text #hashtag",
  "whatsapp": "short conversational message"
}
```
