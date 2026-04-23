import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, forms, InsertForm, fields, InsertField, submissions, InsertSubmission, responses, InsertResponse, csvImports, InsertCsvImport, analysisReports, InsertAnalysisReport } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Forms queries
export async function createForm(data: {
  createdById: number;
  title: string;
  description?: string | null;
  sector: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(forms).values(data);
  return result;
}

export async function getFormById(formId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(forms).where(eq(forms.id, formId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listFormsByCreator(createdById: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(forms).where(eq(forms.createdById, createdById)).orderBy(forms.createdAt);
}

export async function updateForm(formId: number, data: Partial<InsertForm>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(forms).set({ ...data, updatedAt: new Date() }).where(eq(forms.id, formId));
}

export async function deleteForm(formId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(forms).where(eq(forms.id, formId));
}

// Fields queries
export async function createField(data: InsertField) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(fields).values(data);
}

export async function getFieldsByFormId(formId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(fields).where(eq(fields.formId, formId)).orderBy(fields.order);
}

export async function updateField(fieldId: number, data: Partial<InsertField>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(fields).set(data).where(eq(fields.id, fieldId));
}

export async function deleteField(fieldId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(fields).where(eq(fields.id, fieldId));
}

// Submissions queries
export async function createSubmission(data: InsertSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(submissions).values(data);
  return result;
}

export async function getSubmissionById(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getSubmissionsByFormId(formId: number, limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(submissions)
    .where(eq(submissions.formId, formId))
    .orderBy(submissions.submittedAt)
    .limit(limit)
    .offset(offset);
}

export async function countSubmissionsByFormId(formId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({ count: sql`COUNT(*)` }).from(submissions).where(eq(submissions.formId, formId));
  return result[0]?.count || 0;
}

// Responses queries
export async function createResponses(data: InsertResponse[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(responses).values(data);
}

export async function getResponsesBySubmissionId(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(responses).where(eq(responses.submissionId, submissionId));
}

export async function getResponsesByFieldId(fieldId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(responses).where(eq(responses.fieldId, fieldId));
}

// CSV Imports queries
export async function createCsvImport(data: InsertCsvImport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(csvImports).values(data);
}

export async function getCsvImportById(importId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(csvImports).where(eq(csvImports.id, importId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCsvImportsByFormId(formId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(csvImports).where(eq(csvImports.formId, formId)).orderBy(csvImports.createdAt);
}

export async function updateCsvImportStatus(importId: number, status: string, errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status, processedAt: new Date() };
  if (errorMessage) updateData.errorMessage = errorMessage;
  
  return db.update(csvImports).set(updateData).where(eq(csvImports.id, importId));
}

// Analysis Reports queries
export async function createAnalysisReport(data: InsertAnalysisReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(analysisReports).values(data);
}

export async function getAnalysisReportsByFormId(formId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(analysisReports).where(eq(analysisReports.formId, formId)).orderBy(analysisReports.createdAt);
}

export async function getLatestAnalysisReportByFormId(formId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(analysisReports)
    .where(eq(analysisReports.formId, formId))
    .orderBy(analysisReports.createdAt)
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

// Utility function for descriptive statistics
export function calculateDescriptiveStats(values: number[]) {
  if (values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    count: sorted.length,
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

// Utility function for frequency analysis
export function calculateFrequencies(values: string[]) {
  const freq: Record<string, number> = {};
  values.forEach(val => {
    freq[val] = (freq[val] || 0) + 1;
  });
  return Object.entries(freq).map(([value, count]) => ({
    value,
    count,
    percentage: Number((count / values.length * 100).toFixed(2)),
  }));
}
