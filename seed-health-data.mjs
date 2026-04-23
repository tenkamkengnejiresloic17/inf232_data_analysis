import { getDb } from './server/db.ts';
import { forms, fields, submissions, responses } from './drizzle/schema.ts';

const db = await getDb();

if (!db) {
  console.error('Database not available');
  process.exit(1);
}

// Create the main health surveillance form
const formResult = await db.insert(forms).values({
  createdById: 1,
  title: 'Surveillance Épidémiologique - Santé Publique',
  description: 'Formulaire de collecte de données sanitaires pour la surveillance des maladies infectieuses',
  sector: 'Santé Publique',
  isActive: true,
});

const formId = formResult[0].insertId;
console.log(`Created form with ID: ${formId}`);

// Define the form fields
const formFields = [
  { name: 'age', label: 'Âge (années)', type: 'number', required: true, order: 1 },
  { name: 'sexe', label: 'Sexe', type: 'select', options: 'Masculin,Féminin,Autre', required: true, order: 2 },
  { name: 'poids', label: 'Poids (kg)', type: 'number', required: true, order: 3 },
  { name: 'taille', label: 'Taille (cm)', type: 'number', required: true, order: 4 },
  { name: 'sida', label: 'Avez-vous le SIDA ou êtes-vous séropositif(ve)?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 5 },
  { name: 'syphilis', label: 'Avez-vous la syphilis?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 6 },
  { name: 'gonorrhee', label: 'Avez-vous la gonorrhée?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 7 },
  { name: 'chlamydia', label: 'Avez-vous la chlamydia?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 8 },
  { name: 'cholera', label: 'Avez-vous eu le choléra?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 9 },
  { name: 'tuberculose', label: 'Avez-vous la tuberculose?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 10 },
  { name: 'malaria', label: 'Avez-vous eu la malaria?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 11 },
  { name: 'autres_maladies', label: 'Autres maladies chroniques', type: 'text', required: false, order: 12 },
  { name: 'vaccin_covid', label: 'Êtes-vous vacciné(e) contre la COVID-19?', type: 'select', options: 'Oui,Non,Partiellement', required: true, order: 13 },
  { name: 'vaccin_fievre_jaune', label: 'Êtes-vous vacciné(e) contre la fièvre jaune?', type: 'select', options: 'Oui,Non,Inconnu', required: true, order: 14 },
];

// Insert fields
const fieldIds = [];
for (const field of formFields) {
  const result = await db.insert(fields).values({
    formId: formId,
    name: field.name,
    label: field.label,
    type: field.type,
    options: field.options || null,
    required: field.required,
    order: field.order,
  });
  fieldIds.push(result[0].insertId);
}

console.log(`Created ${fieldIds.length} form fields`);

// Generate 30 realistic health data submissions
const submissions_data = [
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

// Insert submissions and responses
for (const data of submissions_data) {
  const submissionResult = await db.insert(submissions).values({
    formId: formId,
    submittedAt: new Date(),
  });
  
  const submissionId = submissionResult[0].insertId;
  
  // Insert responses for each field
  const responseData = [
    { fieldId: fieldIds[0], value: data.age.toString() },
    { fieldId: fieldIds[1], value: data.sexe },
    { fieldId: fieldIds[2], value: data.poids.toString() },
    { fieldId: fieldIds[3], value: data.taille.toString() },
    { fieldId: fieldIds[4], value: data.sida },
    { fieldId: fieldIds[5], value: data.syphilis },
    { fieldId: fieldIds[6], value: data.gonorrhee },
    { fieldId: fieldIds[7], value: data.chlamydia },
    { fieldId: fieldIds[8], value: data.cholera },
    { fieldId: fieldIds[9], value: data.tuberculose },
    { fieldId: fieldIds[10], value: data.malaria },
    { fieldId: fieldIds[11], value: data.autres_maladies },
    { fieldId: fieldIds[12], value: data.vaccin_covid },
    { fieldId: fieldIds[13], value: data.vaccin_fievre_jaune },
  ];
  
  for (const resp of responseData) {
    await db.insert(responses).values({
      submissionId: submissionId,
      fieldId: resp.fieldId,
      value: resp.value,
    });
  }
}

console.log('Successfully inserted 30 health surveillance submissions');
process.exit(0);
