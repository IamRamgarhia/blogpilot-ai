import { markdownToHtml, type ExportPost } from "./common";

export function buildGhostJson(posts: ExportPost[]): string {
  const now = new Date().toISOString();
  const ghostPosts = posts.map((p, i) => ({
    id: i + 1,
    uuid: crypto.randomUUID(),
    title: p.title,
    slug: p.slug,
    html: markdownToHtml(p.draftMarkdown),
    status: "draft",
    created_at: now,
    updated_at: now,
    published_at: p.publishDateISO ?? null,
    meta_title: p.metaTitle,
    meta_description: p.metaDescription,
    custom_excerpt: p.metaDescription,
    feature_image: null
  }));
  const tags = posts
    .map((p) => p.cluster)
    .filter((c, i, arr) => c && arr.indexOf(c) === i)
    .map((c, i) => ({ id: i + 1, name: c, slug: (c as string).toLowerCase().replace(/\s+/g, "-") }));

  return JSON.stringify(
    {
      meta: { exported_on: Date.now(), version: "5.0" },
      data: { posts: ghostPosts, tags, posts_tags: [] }
    },
    null,
    2
  );
}
