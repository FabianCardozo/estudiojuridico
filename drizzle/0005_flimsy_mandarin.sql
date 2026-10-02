ALTER TABLE `legal_documents` ADD `case_id` text;--> statement-breakpoint
ALTER TABLE `legal_documents` ADD `case_title` text;--> statement-breakpoint
CREATE INDEX `idx_legal_documents_owner_case_created` ON `legal_documents` (`owner_id`,`case_id`,`created_at`);