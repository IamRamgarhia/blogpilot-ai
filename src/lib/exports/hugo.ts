import type { ExportPost } from "./common";

function tomlEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildHugoMarkdown(p: ExportPost): string {
  const date = p.publishDateISO ?? new Date().toISOString();
  const keywords = p.primaryKeyword ? `["${tomlEscape(p.primaryKeyword)}"]` : "[]";
  return `+++
title = "${tomlEscape(p.title)}"
date = ${date}
draft = true
slug = "${tomlEscape(p.slug)}"
description = "${tomlEscape(p.metaDescription)}"
keywords = ${keywords}
[seo]
title = "${tomlEscape(p.metaTitle)}"
description = "${tomlEscape(p.metaDescription)}"
+++

${p.draftMarkdown}

<!-- Schema JSON-LD -->
<script type="application/ld+json">
${p.schemaJsonLd}
</script>
`;
}
