export interface ArticleSchemaInput {
  title: string;
  description: string;
  slug: string;
  siteUrl: string;
  authorName?: string;
  authorUrl?: string;
  authorSameAs?: string[];
  publisherName?: string;
  publisherLogoUrl?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export function articleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  const url = new URL(`/blog/${input.slug}`, input.siteUrl).toString();
  const now = new Date().toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title.slice(0, 110),
    description: input.description,
    image: input.image ? [input.image] : undefined,
    datePublished: input.datePublished ?? now,
    dateModified: input.dateModified ?? input.datePublished ?? now,
    author: input.authorName
      ? {
          "@type": "Person",
          name: input.authorName,
          ...(input.authorUrl ? { url: input.authorUrl } : {}),
          ...(input.authorSameAs && input.authorSameAs.length > 0
            ? { sameAs: input.authorSameAs }
            : {})
        }
      : undefined,
    publisher: input.publisherName
      ? {
          "@type": "Organization",
          name: input.publisherName,
          ...(input.publisherLogoUrl
            ? { logo: { "@type": "ImageObject", url: input.publisherLogoUrl } }
            : {})
        }
      : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url }
  };
}

export interface FaqItem { q: string; a: string; }

export function faqSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a }
    }))
  };
}

export function breadcrumbSchema(crumbs: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url
    }))
  };
}

function clean<T extends Record<string, unknown>>(o: T): T {
  for (const k of Object.keys(o)) {
    if (o[k] === undefined) delete o[k];
    else if (o[k] && typeof o[k] === "object" && !Array.isArray(o[k])) {
      clean(o[k] as Record<string, unknown>);
    }
  }
  return o;
}

export function combineSchemas(...schemas: Array<Record<string, unknown> | null | undefined>): string {
  const list = schemas.filter(Boolean).map((s) => clean(s as Record<string, unknown>));
  if (list.length === 1) return JSON.stringify(list[0], null, 2);
  return JSON.stringify({ "@context": "https://schema.org", "@graph": list }, null, 2);
}
