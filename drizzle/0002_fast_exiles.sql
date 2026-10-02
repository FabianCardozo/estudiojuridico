CREATE TABLE `lawyer_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lawyer_accounts_email` ON `lawyer_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `lawyer_profiles` (
	`account_id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`specialty` text NOT NULL,
	`license_number` text,
	`phone` text,
	`email` text NOT NULL,
	`address` text,
	`bio` text,
	`photo_key` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lawyer_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_lawyer_sessions_account` ON `lawyer_sessions` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_lawyer_sessions_expiry` ON `lawyer_sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `interview_requests` ADD `preferred_date` text;--> statement-breakpoint
ALTER TABLE `interview_requests` ADD `preferred_hour` text;