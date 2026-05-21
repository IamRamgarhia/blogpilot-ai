---
id: schema-product
title: Product Schema (JSON-LD)
when: Pages with a single product (review pages, product pages, software product pages)
inputs: product name, brand, image, sku/identifier, price, currency, availability, rating
outputs: Product JSON-LD with optional Review + AggregateRating
source: schema.org/Product + Google Rich Results Test docs for Product
---

# Product Schema

Required for shopping rich results and review snippets.

## Minimum required fields

- `@type`: `"Product"`
- `name`
- `image` (1-4 URLs, ≥ 1200x630 recommended for one)
- `description`
- `brand` (string OR `{ "@type": "Brand", "name": "..." }`)
- One of:
  - `sku` (or `mpn`, `gtin13`, `gtin8`, `gtin12`, `gtin14`)

## Strongly recommended

- `offers` block with: `price`, `priceCurrency`, `availability` (`InStock` / `OutOfStock` / `PreOrder` / etc.), `url`, `priceValidUntil`
- `aggregateRating` with: `ratingValue`, `reviewCount` or `ratingCount` — only if those ratings exist on the page

## Template

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Acme Widget Pro",
  "image": ["https://example.com/widget-1200.webp"],
  "description": "A succinct product description (≤ 5000 chars).",
  "brand": { "@type": "Brand", "name": "Acme" },
  "sku": "ACM-WID-001",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/acme-widget-pro",
    "priceCurrency": "USD",
    "price": "49.00",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2026-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "142"
  }
}
```

## Rules

- Price MUST match the visible page price.
- Availability MUST reflect real stock state.
- aggregateRating MUST reference visible reviews on the page (Google validates).
- Currency in ISO 4217 format (`USD`, `EUR`, `INR`, `GBP`).
- Image URLs absolute, HTTPS, accessible (not behind login).

## Anti-patterns Google penalizes

- Inflated ratings (`ratingValue: 5.0` with no real reviews)
- Bogus reviews
- Hidden reviews behind tabs while schema says "visible"
- Different price in schema vs page body
