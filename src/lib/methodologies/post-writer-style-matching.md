---
id: post-writer-style-matching
title: Post Writer + Style Matching
when: When writing the full draft from an approved outline
inputs: approved outline, client style profile (tone, sentence length, voice, CTA style), primary keyword, language
outputs: full post in Markdown
source: Backlinko writing patterns + Google Helpful Content guidelines
---

# Post Writer + Style Matching

Write the full draft strictly following the approved outline. Match the client's detected style profile:

- **Tone:** formal / conversational / technical — never override the profile.
- **Voice:** first-person, second-person ("you"), or third-person — match the profile.
- **Sentence length:** match the profile's average (short under 15 words; long over 25).
- **Heading case:** Title Case or sentence case — match the profile.
- **CTA style:** newsletter / affiliate / product-plug / inline-link — match the profile.

Write in the post's detected language. Do NOT translate or switch language.

## Rules

1. Output in Markdown. Use `#`/`##`/`###` for headings exactly as outlined.
2. Primary keyword appears in: H1, first 100 words, at least one H2, and the conclusion.
3. Each paragraph 2-4 sentences max. No walls of text.
4. Use transition words to bridge sections ("In contrast," "Beyond that," "Here is why").
5. Use active voice. Passive voice ratio under 10%.
6. For data claims you cannot verify, write the placeholder `[CITE: claim]` immediately after the claim.
7. For internal links, write `[INTERNAL LINK: topic-name]` placeholders.
8. For images, insert `![alt text](IMAGE: description)` placeholders matching the outline's image suggestions.
9. End with the conclusion + CTA from the outline.
10. Do NOT add a JSON-LD schema block — that is generated separately.

Return ONLY the Markdown body. No preamble, no JSON wrapper, no markdown fences.
