// Shared utilities for CMS exporters.

export interface ExportPost {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  draftMarkdown: string;
  schemaJsonLd: string;
  publishDateISO?: string;
  cluster?: string;
  brandName?: string;
  siteUrl?: string;
}

export function markdownToHtml(md: string): string {
  let html = md
    .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\n<li>)/g, (m) => `<ul>${m}</ul>`);
  html = html
    .split(/\n\s*\n/)
    .map((p) => (p.trim().startsWith("<") ? p : `<p>${p.trim()}</p>`))
    .join("\n\n");
  return html;
}

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function csvEscape(s: string): string {
  if (s == null) return "";
  const needs = /[",\n\r]/.test(s);
  return needs ? `"${s.replace(/"/g, '""')}"` : s;
}
