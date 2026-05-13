import { markdownToHtml, xmlEscape, type ExportPost } from "./common";

function pubDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toUTCString();
}

function postItem(p: ExportPost, index: number): string {
  const html = markdownToHtml(p.draftMarkdown);
  const date = pubDate(p.publishDateISO);
  const author = "blogpilot";
  return `
  <item>
    <title>${xmlEscape(p.title)}</title>
    <pubDate>${date}</pubDate>
    <dc:creator><![CDATA[${author}]]></dc:creator>
    <guid isPermaLink="false">${xmlEscape(p.siteUrl ?? "")}/?p=${1000 + index}</guid>
    <description></description>
    <content:encoded><![CDATA[${html}]]></content:encoded>
    <excerpt:encoded><![CDATA[${p.metaDescription}]]></excerpt:encoded>
    <wp:post_id>${1000 + index}</wp:post_id>
    <wp:post_date>${new Date(p.publishDateISO ?? Date.now()).toISOString().slice(0, 19).replace("T", " ")}</wp:post_date>
    <wp:post_name>${xmlEscape(p.slug)}</wp:post_name>
    <wp:status>draft</wp:status>
    <wp:post_type>post</wp:post_type>
    <wp:postmeta>
      <wp:meta_key>_yoast_wpseo_title</wp:meta_key>
      <wp:meta_value><![CDATA[${p.metaTitle}]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>_yoast_wpseo_metadesc</wp:meta_key>
      <wp:meta_value><![CDATA[${p.metaDescription}]]></wp:meta_value>
    </wp:postmeta>
    <wp:postmeta>
      <wp:meta_key>schema_jsonld</wp:meta_key>
      <wp:meta_value><![CDATA[${p.schemaJsonLd}]]></wp:meta_value>
    </wp:postmeta>${p.cluster ? `
    <category domain="category" nicename="${xmlEscape(p.cluster)}"><![CDATA[${p.cluster}]]></category>` : ""}
  </item>`;
}

export function buildWordPressWXR(posts: ExportPost[], siteUrl = "https://example.com", siteName = "BlogPilot Export"): string {
  const items = posts.map(postItem).join("\n");
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
     xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:wp="http://wordpress.org/export/1.2/">
  <channel>
    <title>${xmlEscape(siteName)}</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>BlogPilot AI export</description>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <language>en-US</language>
    <wp:wxr_version>1.2</wp:wxr_version>
    <wp:base_site_url>${xmlEscape(siteUrl)}</wp:base_site_url>
    <wp:base_blog_url>${xmlEscape(siteUrl)}</wp:base_blog_url>
${items}
  </channel>
</rss>`;
}
