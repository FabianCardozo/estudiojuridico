CREATE TABLE `interview_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`document` text,
	`phone` text NOT NULL,
	`email` text,
	`preferred_channel` text NOT NULL,
	`interview_mode` text NOT NULL,
	`reason` text NOT NULL,
	`preferred_time` text,
	`urgency` text NOT NULL,
	`status` text NOT NULL,
	`appointment_at` text,
	`internal_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_interview_requests_status_created` ON `interview_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_interview_requests_phone` ON `interview_requests` (`phone`);