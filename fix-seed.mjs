import { getDb } from './server/db.ts';
import { forms, fields, submissions, responses } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();

if (!db) {
  console.error('Database not available');
  process.exit(1);
}

// Find the latest health form
const allForms = await db.select().from(forms).where(eq(forms.isActive, true));
const healthForm = allForms.find(f => f.title.includes('Surveillance'));

if (!healthForm) {
  console.error('Health form not found');
  process.exit(1);
}

console.log(`Found health form ID: ${healthForm.id}`);

// Get or create fields
let formFields = await db.select().from(fields).where(eq(fields.formId, healthForm.id));

if (formFields.length === 0) {
  console.log('Creating fields...');
  const fieldDefs = [
    { name: 'age', label: 'Âge (années)', type: 'number', required: true, order: 1 },
    { name: 'sexe', label: 'Sexe', type: 'select', options: 'Masculin,Féminin,Autre', required: true, order: 2 },
    { name: 'poids', label: 'Poids (kg)', type: 'number', required: true, order: 3 },
    { name: 'taille', label: 'Taille (cm)', type: 'number', required: true, order: 4 },
    { name: 'sida', label: 'Avez-vous le SIDA?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 5 },
    { name: 'syphilis', label: 'Avez-vous la syphilis?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 6 },
    { name: 'gonorrhee', label: 'Avez-vous la gonorrhée?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 7 },
    { name: 'chlamydia', label: 'Avez-vous la chlamydia?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 8 },
    { name: 'cholera', label: 'Avez-vous eu le choléra?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 9 },
    { name: 'tuberculose', label: 'Avez-vous la tuberculose?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 10 },
    { name: 'malaria', label: 'Avez-vous eu la malaria?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 11 },
    { name: 'autres_maladies', label: 'Autres maladies', type: 'text', required: false, order: 12 },
    { name: 'vaccin_covid', label: 'Vaccin COVID-19?', type: 'select', options: 'Oui,Non,Partiellement', required: true, order: 13 },
    { name: 'vaccin_fievre_jaune', label: 'Vaccin fièvre jaune?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 14 },
  ];

  for (const field of fieldDefs) {
    await db.insert(fields).values({
      formId: healthForm.id,
      name: field.name,
      label: field.label,
      type: field.type,
      options: field.options || null,
      required: field.required,
      order: field.order,
    });
  }
  console.log(`Created ${fieldDefs.length} fields`);
  formFields = await db.select().from(fields).where(eq(fields.formId, healthForm.id));
}

// Check submissions
const existingSubs = await db.select().from(submissions).where(eq(submissions.formId, healthForm.id));
console.log(`Existing submissions: ${existingSubs.length}`);

if (existingSubs.length === 0) {
  console.log('Creating 30 submissions...');
  const submissionsData = [
    { age: 28, sexe: 'Masculin', poids: 75, taille: 180, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 35, sexe: 'Féminin', poids: 62, taille: 165, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: 'Diabète', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 42, sexe: 'Masculin', poids: 82, taille: 175, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: 'Hypertension', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Non' },
    { age: 19, sexe: 'Féminin', poids: 58, taille: 162, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 51, sexe: 'Masculin', poids: 88, taille: 178, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Oui', malaria: 'Oui', autres_maladies: 'Asthme', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 26, sexe: 'Féminin', poids: 65, taille: 168, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Oui', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 33, sexe: 'Masculin', poids: 79, taille: 182, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 45, sexe: 'Féminin', poids: 70, taille: 170, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: 'Arthrite', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 22, sexe: 'Masculin', poids: 72, taille: 176, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 38, sexe: 'Féminin', poids: 68, taille: 167, sida: 'Non', syphilis: 'Oui', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 29, sexe: 'Masculin', poids: 76, taille: 179, sida: 'Non', syphilis: 'Non', gonorrhee: 'Oui', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 55, sexe: 'Féminin', poids: 75, taille: 165, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: 'Cholestérol', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Non' },
    { age: 24, sexe: 'Masculin', poids: 70, taille: 174, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 41, sexe: 'Féminin', poids: 72, taille: 169, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Oui', tuberculose: 'Non', malaria: 'Oui', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 31, sexe: 'Masculin', poids: 81, taille: 181, sida: 'Oui', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 27, sexe: 'Féminin', poids: 61, taille: 164, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 48, sexe: 'Masculin', poids: 85, taille: 177, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Oui', malaria: 'Oui', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 20, sexe: 'Féminin', poids: 57, taille: 161, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 36, sexe: 'Masculin', poids: 78, taille: 180, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 44, sexe: 'Féminin', poids: 69, taille: 168, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: 'Migraine', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 23, sexe: 'Masculin', poids: 73, taille: 177, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 39, sexe: 'Féminin', poids: 66, taille: 166, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 30, sexe: 'Masculin', poids: 77, taille: 179, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 52, sexe: 'Féminin', poids: 73, taille: 167, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: 'Ostéoporose', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Non' },
    { age: 25, sexe: 'Masculin', poids: 71, taille: 175, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 43, sexe: 'Féminin', poids: 71, taille: 170, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 32, sexe: 'Masculin', poids: 80, taille: 182, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 28, sexe: 'Féminin', poids: 64, taille: 165, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 46, sexe: 'Masculin', poids: 83, taille: 178, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Oui', autres_maladies: 'Prostate', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
    { age: 21, sexe: 'Féminin', poids: 59, taille: 163, sida: 'Non', syphilis: 'Non', gonorrhee: 'Non', chlamydia: 'Non', cholera: 'Non', tuberculose: 'Non', malaria: 'Non', autres_maladies: '', vaccin_covid: 'Oui', vaccin_fievre_jaune: 'Oui' },
  ];

  for (const data of submissionsData) {
    const subResult = await db.insert(submissions).values({
      formId: healthForm.id,
      submittedAt: new Date(),
    });
    
    const subId = subResult[0].insertId;
    
    const responseValues = formFields.map(field => ({
      submissionId: subId,
      fieldId: field.id,
      value: String(data[field.name] || ''),
    }));
    
    if (responseValues.length > 0) {
      await db.insert(responses).values(responseValues);
    }
  }
  console.log('Created 30 submissions with responses');
}

console.log('Done!');
process.exit(0);
