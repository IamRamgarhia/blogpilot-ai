import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  niche: text("niche"),
  language: text("language"),
  country: text("country"),
  styleProfile: text("style_profile_json"),
  discoverySnapshot: text("discovery_snapshot_json"),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`)
});

export const aiKeys = sqliteTable("ai_keys", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  keyCiphertext: text("key_ciphertext").notNull(),
  baseUrl: text("base_url"),
  model: text("model"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  priority: integer("priority").notNull().default(100),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`)
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  status: text("status").notNull().default("idea"),
  title: text("title"),
  primaryKeyword: text("primary_keyword"),
  intent: text("intent"),
  outlineJson: text("outline_json"),
  draftMarkdown: text("draft_markdown"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  schemaJsonLd: text("schema_jsonld"),
  socialJson: text("social_json"),
  newsletterJson: text("newsletter_json"),
  publishDate: integer("publish_date"),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch())`)
});

export const rankHistory = sqliteTable("rank_history", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  postId: text("post_id").references(() => posts.id),
  keyword: text("keyword").notNull(),
  url: text("url"),
  position: integer("position"),
  source: text("source").notNull().default("bing"),
  checkedAt: integer("checked_at").notNull().default(sql`(unixepoch())`)
});

export const gscData = sqliteTable("gsc_data", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  date: text("date").notNull(),
  url: text("url").notNull(),
  query: text("query"),
  clicks: integer("clicks").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  position: integer("position"),
  ctr: integer("ctr_micro").notNull().default(0),
  importedAt: integer("imported_at").notNull().default(sql`(unixepoch())`)
});

export const ga4Data = sqliteTable("ga4_data", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  date: text("date").notNull(),
  url: text("url").notNull(),
  organicSessions: integer("organic_sessions").notNull().default(0),
  organicUsers: integer("organic_users").notNull().default(0),
  bounceRate: integer("bounce_rate_micro").notNull().default(0),
  avgSessionDurationSec: integer("avg_session_duration_sec").notNull().default(0),
  importedAt: integer("imported_at").notNull().default(sql`(unixepoch())`)
});

export const decayAlerts = sqliteTable("decay_alerts", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  postId: text("post_id").references(() => posts.id),
  url: text("url").notNull(),
  signal: text("signal").notNull(),
  severity: text("severity").notNull(),
  detailJson: text("detail_json"),
  resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`)
});

export const shareLinks = sqliteTable("share_links", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id),
  token: text("token").notNull().unique(),
  scope: text("scope").notNull().default("calendar"),
  expiresAt: integer("expires_at"),
  revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`)
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  payloadJson: text("payload_json").notNull(),
  status: text("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  resultJson: text("result_json"),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
  startedAt: integer("started_at"),
  finishedAt: integer("finished_at")
});

export const usageEvents = sqliteTable("usage_events", {
  id: text("id").primaryKey(),
  clientId: text("client_id"),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  promptTokens: integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  estCostUsdMicro: integer("est_cost_usd_micro").notNull(),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`)
});
