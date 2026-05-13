CREATE TABLE `share_links` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`token` text NOT NULL,
	`scope` text DEFAULT 'calendar' NOT NULL,
	`expires_at` integer,
	`revoked` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `share_links_token_unique` ON `share_links` (`token`);--> statement-breakpoint
ALTER TABLE `posts` ADD `newsletter_json` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `publish_date` integer;