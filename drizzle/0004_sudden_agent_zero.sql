CREATE TABLE `legal_document_chunks` (
	`document_id` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_legal_document_chunks_document_index` ON `legal_document_chunks` (`document_id`,`chunk_index`);--> statement-breakpoint
CREATE TABLE `legal_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`client_name` text NOT NULL,
	`observations` text,
	`active` integer NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_legal_documents_owner_created` ON `legal_documents` (`owner_id`,`created_at`);