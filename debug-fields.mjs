import { getDb } from './server/db.ts';
import { forms, fields } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();
const allForms = await db.select().from(forms);
const healthForm = allForms.find(f => f.title.includes('Surveillance'));

if (healthForm) {
  const formFields = await db.select().from(fields).where(eq(fields.formId, healthForm.id));
  console.log('Fields for form', healthForm.id);
  formFields.forEach(f => {
    console.log(`ID: ${f.id}, Name: ${f.name}, Label: ${f.label}, Type: ${f.type}, Options: ${f.options}`);
  });
}
