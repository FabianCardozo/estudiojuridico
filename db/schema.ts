import { sqliteTable, text, integer, index, uniqueIndex, blob } from "drizzle-orm/sqlite-core";

export const lawyerAccounts = sqliteTable("lawyer_accounts", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [uniqueIndex("idx_lawyer_accounts_email").on(table.email)]);

export const lawyerSessions = sqliteTable("lawyer_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  accountId: text("account_id").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_lawyer_sessions_account").on(table.accountId), index("idx_lawyer_sessions_expiry").on(table.expiresAt)]);

export const lawyerProfiles = sqliteTable("lawyer_profiles", {
  accountId: text("account_id").primaryKey(),
  fullName: text("full_name").notNull(),
  specialty: text("specialty").notNull(),
  licenseNumber: text("license_number"),
  phone: text("phone"),
  email: text("email").notNull(),
  address: text("address"),
  bio: text("bio"),
  photoKey: text("photo_key"),
  photoType: text("photo_type"),
  photoData: blob("photo_data", { mode: "buffer" }),
  updatedAt: integer("updated_at").notNull(),
});

export const workspaces = sqliteTable("workspaces", {
  ownerId: text("owner_id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const interviewRequests = sqliteTable("interview_requests", {
  id: text("id").primaryKey(), firstName: text("first_name").notNull(), lastName: text("last_name").notNull(),
  document: text("document"), phone: text("phone").notNull(), email: text("email"),
  preferredChannel: text("preferred_channel").notNull(), interviewMode: text("interview_mode").notNull(),
  reason: text("reason").notNull(), preferredTime: text("preferred_time"), urgency: text("urgency").notNull(),
  preferredDate: text("preferred_date"), preferredHour: text("preferred_hour"),
  status: text("status").notNull(), appointmentAt: text("appointment_at"), internalNote: text("internal_note"),
  createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
}, (table) => [index("idx_interview_requests_status_created").on(table.status, table.createdAt), index("idx_interview_requests_phone").on(table.phone)]);

export const legalDocuments = sqliteTable("legal_documents", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), title: text("title").notNull(),
  clientName: text("client_name").notNull(), observations: text("observations"), active: integer("active", { mode: "boolean" }).notNull(),
  caseId: text("case_id"), caseTitle: text("case_title"),
  fileName: text("file_name").notNull(), fileType: text("file_type").notNull(), fileSize: integer("file_size").notNull(),
  createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
}, (table) => [
  index("idx_legal_documents_owner_created").on(table.ownerId, table.createdAt),
  index("idx_legal_documents_owner_case_created").on(table.ownerId, table.caseId, table.createdAt),
]);

export const legalDocumentChunks = sqliteTable("legal_document_chunks", {
  documentId: text("document_id").notNull(), chunkIndex: integer("chunk_index").notNull(), data: text("data").notNull(),
}, (table) => [uniqueIndex("idx_legal_document_chunks_document_index").on(table.documentId, table.chunkIndex)]);
