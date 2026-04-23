# INF 232 EC2 - Plateforme de Collecte et Analyse de Données - TODO

## Phase 1 : Planification et Architecture
- [x] Initialiser le projet avec scaffold web-db-user
- [x] Concevoir le schéma de base de données
- [x] Documenter l'architecture globale

## Phase 2 : Schéma de Base de Données
- [x] Créer les tables : users, forms, fields, submissions, responses, csv_imports
- [x] Générer et appliquer les migrations SQL
- [x] Vérifier l'intégrité des relations

## Phase 3 : Backend - Procédures tRPC et Helpers
- [x] Implémenter les helpers de base de données pour forms
- [x] Implémenter les helpers pour submissions et responses
- [x] Implémenter les helpers pour csv_imports
- [x] Créer les procédures tRPC pour la gestion des formulaires (create, list, update, delete)
- [x] Créer les procédures tRPC pour les soumissions (submit, list, export CSV)
- [x] Créer les procédures tRPC pour l'analyse descriptive (calculate stats)
- [x] Créer les procédures tRPC pour l'import CSV
- [x] Intégrer les notifications au propriétaire
- [x] Écrire les tests vitest pour les procédures critiques

## Phase 4 : Frontend - Authentification et Pages Publiques
- [x] Configurer le thème minimaliste scandinave (couleurs, typographie, espacements)
- [x] Implémenter la page d'accueil publique
- [x] Implémenter la page de soumission de formulaire public
- [x] Implémenter le système d'authentification et login
- [x] Implémenter le dashboard administrateur avec sidebar
- [x] Implémenter la gestion des rôles (admin vs user)
- [x] Rendre l'interface responsive (mobile, tablet, desktop)

## Phase 5 : Visualisations et Analyse Descriptive
- [x] Implémenter le calcul des statistiques descriptives (moyenne, médiane, écart-type, min/max, fréquences)
- [x] Créer les composants Recharts : histogrammes, boîtes à moustaches, diagrammes en barres, camemberts
- [x] Implémenter le tableau de bord d'analyse avec visualisations interactives
- [x] Intégrer les graphiques dans la page d'administration des formulaires

## Phase 6 : Génération de Rapports LLM et Notifications
- [x] Intégrer l'API LLM pour la génération de rapports
- [x] Implémenter la génération automatique de rapports d'interprétation
- [x] Implémenter les notifications automatiques au propriétaire
- [x] Créer l'interface d'affichage des rapports générés

## Phase 7 : Import et Export CSV
- [x] Implémenter l'upload et l'import de fichiers CSV
- [x] Implémenter le stockage sécurisé des fichiers CSV
- [x] Implémenter l'export des données en CSV
- [x] Créer l'interface pour la gestion des imports
- [x] Implémenter l'analyse des fichiers CSV importés

## Phase 8 : Tests et Corrections
- [x] Tester les formulaires de collecte
- [x] Tester l'analyse descriptive et les visualisations
- [x] Tester l'import/export CSV
- [x] Tester la génération de rapports LLM
- [x] Tester l'authentification et les rôles
- [x] Corriger les bugs identifiés
- [x] Vérifier la responsivité sur tous les appareils

## Phase 9 : Déploiement et Livraison
- [x] Créer un checkpoint final
- [x] Vérifier le déploiement en ligne
- [x] Livrer le résultat à l'utilisateur

## Bugs à corriger
- [x] Créer la page `/forms` pour afficher la liste des formulaires publics
- [x] Corriger la navigation depuis la page d'accueil vers les formulaires

- [x] Corriger les boutons des fonctionnalités principales pour les rendre cliquables

## Phase 10 : Adaptation pour la Surveillance Épidémiologique
- [x] Adapter le schéma de base de données pour les données sanitaires
- [x] Créer le formulaire de collecte de données de santé publique
- [x] Ajouter les questions sur les maladies (SIDA, MST, choléra, etc.)
- [x] Ajouter les champs démographiques (âge, poids, sexe, etc.)
- [x] Remplir la base de données avec 30 formulaires de test réalistes
- [x] Adapter l'analyse pour les tendances épidémiologiques
- [x] Tester et valider les données


## Phase 11 : Comparaison Démographique
- [x] Implémenter la procédure tRPC pour comparer les maladies par groupe d'âge
- [x] Implémenter la procédure tRPC pour comparer les maladies par sexe
- [x] Créer l'interface de sélection des groupes de comparaison
- [x] Ajouter les visualisations comparatives (graphiques côte à côte)
- [x] Tester et valider les comparaisons
