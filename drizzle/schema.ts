import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Forms table: stores form definitions created by admins
 */
export const forms = mysqlTable("forms", {
  id: int("id").autoincrement().primaryKey(),
  createdById: int("createdById").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sector: varchar("sector", { length: 100 }).notNull(), // e.g., "healthcare", "education", "retail"
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  createdByIdx: index("createdBy_idx").on(table.createdById),
}));

export type Form = typeof forms.$inferSelect;
export type InsertForm = typeof forms.$inferInsert;

/**
 * Fields table: stores field definitions for each form
 */
export const fields = mysqlTable("fields", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "number", "email", "date", "select", "checkbox", "radio", "textarea"]).notNull(),
  isRequired: boolean("isRequired").default(false).notNull(),
  options: json("options"), // For select, radio, checkbox - stored as JSON array
  order: int("order").notNull(), // Field display order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  formIdIdx: index("formId_idx").on(table.formId),
}));

export type Field = typeof fields.$inferSelect;
export type InsertField = typeof fields.$inferInsert;

/**
 * Submissions table: stores form submission metadata
 */
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // Support IPv6
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  formIdIdx: index("formId_idx").on(table.formId),
  submittedAtIdx: index("submittedAt_idx").on(table.submittedAt),
}));

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

/**
 * Responses table: stores individual field responses for each submission
 */
export const responses = mysqlTable("responses", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  fieldId: int("fieldId").notNull(),
  value: text("value"), // Stored as text, parsed based on fieldType
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  submissionIdIdx: index("submissionId_idx").on(table.submissionId),
  fieldIdIdx: index("fieldId_idx").on(table.fieldId),
}));

export type Response = typeof responses.$inferSelect;
export type InsertResponse = typeof responses.$inferInsert;

/**
 * CSV Imports table: stores metadata about imported CSV files
 */
export const csvImports = mysqlTable("csvImports", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  uploadedById: int("uploadedById").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 storage key
  fileUrl: varchar("fileUrl", { length: 500 }), // S3 file URL
  rowCount: int("rowCount").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
}, (table) => ({
  formIdIdx: index("formId_idx").on(table.formId),
  uploadedByIdx: index("uploadedBy_idx").on(table.uploadedById),
}));

export type CsvImport = typeof csvImports.$inferSelect;
export type InsertCsvImport = typeof csvImports.$inferInsert;

/**
 * Analysis Reports table: stores generated LLM analysis reports
 */
export const analysisReports = mysqlTable("analysisReports", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  generatedById: int("generatedById").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"), // LLM-generated report content
  summary: text("summary"), // Brief summary of findings
  trends: json("trends"), // Detected trends as JSON
  anomalies: json("anomalies"), // Detected anomalies as JSON
  statistics: json("statistics"), // Statistical summary as JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  formIdIdx: index("formId_idx").on(table.formId),
}));

export type AnalysisReport = typeof analysisReports.$inferSelect;
export type InsertAnalysisReport = typeof analysisReports.$inferInsert;