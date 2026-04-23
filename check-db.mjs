import { getDb } from './server/db.ts';
import { forms, fields, submissions } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();

if (!db) {
  console.error('Database not available');
  process.exit(1);
}

// Get all forms
const allForms = await db.select().from(forms);
console.log('Total forms:', allForms.length);
allForms.forEach(f => console.log(`- Form ${f.id}: ${f.title}`));

// Get fields for the health form
if (allForms.length > 0) {
  const healthForm = allForms.find(f => f.title.includes('Surveillance'));
  if (healthForm) {
    console.log(`\nHealth form ID: ${healthForm.id}`);
    const formFields = await db.select().from(fields).where(eq(fields.formId, healthForm.id));
    console.log(`Fields: ${formFields.length}`);
    formFields.forEach(f => console.log(`- ${f.name}: ${f.label}`));
    
    // Get submissions
    const subs = await db.select().from(submissions).where(eq(submissions.formId, healthForm.id));
    console.log(`\nSubmissions: ${subs.length}`);
  }
}

process.exit(0);
