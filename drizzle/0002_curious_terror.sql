CREATE TABLE `decay_alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`post_id` text,
	`url` text NOT NULL,
	`signal` text NOT NULL,
	`severity` text NOT NULL,
	`detail_json` text,
	`resolved` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ga4_data` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`date` text NOT NULL,
	`url` text NOT NULL,
	`organic_sessions` integer DEFAULT 0 NOT NULL,
	`organic_users` integer DEFAULT 0 NOT NULL,
	`bounce_rate_micro` integer DEFAULT 0 NOT NULL,
	`avg_session_duration_sec` integer DEFAULT 0 NOT NULL,
	`imported_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `gsc_data` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`date` text NOT NULL,
	`url` text NOT NULL,
	`query` text,
	`clicks` integer DEFAULT 0 NOT NULL,
	`impressions` integer DEFAULT 0 NOT NULL,
	`position` integer,
	`ctr_micro` integer DEFAULT 0 NOT NULL,
	`imported_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rank_history` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`post_id` text,
	`keyword` text NOT NULL,
	`url` text,
	`position` integer,
	`source` text DEFAULT 'bing' NOT NULL,
	`checked_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
