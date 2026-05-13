import { markdownToHtml, csvEscape, type ExportPost } from "./common";

const COLUMNS = [
  "Name",
  "Slug",
  "Author",
  "Post Body",
  "Post Summary",
  "Main Image",
  "Thumbnail Image",
  "Featured?",
  "Draft?",
  "SEO Title",
  "SEO Meta Description"
];

export function buildWebflowCsv(posts: ExportPost[], authorName = "BlogPilot"): string {
  const header = COLUMNS.map(csvEscape).join(",");
  const rows = posts.map((p) =>
    [
      p.title,
      p.slug,
      authorName,
      markdownToHtml(p.draftMarkdown).replace(/\r?\n+/g, " "),
      p.metaDescription,
      "",
      "",
      "false",
      "true",
      p.metaTitle,
      p.metaDescription
    ]
      .map((s) => csvEscape(String(s ?? "")))
      .join(",")
  );
  return [header, ...rows].join("\n");
}
