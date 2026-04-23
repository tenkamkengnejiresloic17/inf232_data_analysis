import { getDb } from './server/db.ts';
import { forms, fields, submissions, responses } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();

// Delete old health forms
const allForms = await db.select().from(forms);
const healthForms = allForms.filter(f => f.title.includes('Surveillance'));

for (const form of healthForms) {
  const subs = await db.select().from(submissions).where(eq(submissions.formId, form.id));
  for (const sub of subs) {
    await db.delete(responses).where(eq(responses.submissionId, sub.id));
  }
  await db.delete(submissions).where(eq(submissions.formId, form.id));
  await db.delete(fields).where(eq(fields.formId, form.id));
  await db.delete(forms).where(eq(forms.id, form.id));
}

console.log('Deleted old data');

// Create new form
const formResult = await db.insert(forms).values({
  createdById: 1,
  title: 'Surveillance Épidémiologique - Santé Publique',
  description: 'Formulaire de collecte de données sanitaires pour la surveillance des maladies infectieuses',
  sector: 'Santé Publique',
  isActive: true,
});

const formId = formResult[0].insertId;
console.log(`Created form with ID: ${formId}`);

// Create fields with correct schema columns
const fieldDefs = [
  { name: 'age', label: 'Âge (années)', fieldType: 'number', isRequired: true, order: 1, options: null },
  { name: 'sexe', label: 'Sexe', fieldType: 'select', isRequired: true, order: 2, options: ['Masculin', 'Féminin', 'Autre'] },
  { name: 'poids', label: 'Poids (kg)', fieldType: 'number', isRequired: true, order: 3, options: null },
  { name: 'taille', label: 'Taille (cm)', fieldType: 'number', isRequired: true, order: 4, options: null },
  { name: 'sida', label: 'Avez-vous le SIDA?', fieldType: 'select', isRequired: true, order: 5, options: ['Oui', 'Non', 'Inconnu'] },
  { name: 'syphilis', label: 'Avez-vous la syphilis?', fieldType: 'select', isRequired: true, order: 6, options: ['Oui', 'Non', 'Inconnu'] },
  { name: 'gonorrhee', label: 'Avez-vous la gonorrhée?', fieldType: 'select', isRequired: true, order: 7, options: ['Oui', 'Non', 'Inconnu'] },
  { name: 'chlamydia', label: 'Avez-vous la chlamydia?', fieldType: 'select', isRequired: true, order: 8, options: ['Oui', 'Non', 'Inconnu'] },
  { name: 'cholera', label: 'Avez-vous eu le choléra?', fieldType: 'select', isRequired: true, order: 9, options: ['Oui', 'Non', 'Inconnu'] },
  { name: 'tuberculose', label: 'Avez-vous la tuberculose?', fieldType: 'select', isRequired: true, order: 10, options: ['Oui', 'Non', 'Inconnu'] },
  { name: 'malaria', label: 'Avez-vous eu la malaria?', fieldType: 'select', isRequired: true, order: 11, options: ['Oui', 'Non', 'Inconnu'] },
  { name: 'autres_maladies', label: 'Autres maladies', fieldType: 'textarea', isRequired: false, order: 12, options: null },
  { name: 'vaccin_covid', label: 'Vaccin COVID-19?', fieldType: 'select', isRequired: true, order: 13, options: ['Oui', 'Non', 'Partiellement'] },
  { name: 'vaccin_fievre_jaune', label: 'Vaccin fièvre jaune?', fieldType: 'select', isRequired: true, order: 14, options: ['Oui', 'Non', 'Inconnu'] },
];

const fieldIds = [];
for (const field of fieldDefs) {
  const result = await db.insert(fields).values({
    formId: formId,
    label: field.label,
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    options: field.options,
    order: field.order,
  });
  fieldIds.push(result[0].insertId);
}

console.log(`Created ${fieldIds.length} fields`);

// Create 30 submissions
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
    formId: formId,
    submittedAt: new Date(),
  });
  
  const subId = subResult[0].insertId;
  const responseValues = [];
  
  for (let i = 0; i < fieldDefs.length; i++) {
    const field = fieldDefs[i];
    const fieldId = fieldIds[i];
    responseValues.push({
      submissionId: subId,
      fieldId: fieldId,
      value: String(data[field.name] || ''),
    });
  }
  
  if (responseValues.length > 0) {
    await db.insert(responses).values(responseValues);
  }
}

console.log('Created 30 submissions with responses');
process.exit(0);
