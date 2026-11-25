# ADR-0001 — Choix de la stack : Vue 3 + Node.js (Express) + SQLite

- **Statut** : Accepted
- **Date** : 2026-11-25
- **Décideurs** : Carolinedanslesnuages, via ADA
- **Sujet** : stack technique du projet Objets trouvés

## Contexte
Les agents d'accueil de la mairie enregistrent les objets trouvés (description, lieu, date). Le projet démarre comme POC réalisé par un PO avec un assistant de code ; seules
les stacks d'ADA sont autorisées. L'interface respecte le DSFR.

## Options considérées
### Option A — Vue 3 + Node.js (Express) + SQLite
- Petite application, peu de règles : une API légère, sans compilation, une base dans un fichier.
### Option B — Vue 3 + NestJS + PostgreSQL
- Plus de structure (modules, injection), base serveur.
- **Pourquoi pas** : plus lourd que nécessaire pour un besoin simple.

## Décision
**Option retenue : A** — choix du PO, conforme aux consignes de l'équipe technique.

## Conséquences
- **Positives** : démarrage immédiat, aucune base à installer ; tests, accessibilité et CI d'ADA d'emblée.
- **Négatives** : SQLite convient à un usage modéré (un serveur, peu d'écritures simultanées).
- **À surveiller** : beaucoup d'utilisateurs simultanés ou de règles métier = passer à NestJS +
  PostgreSQL (nouvelle ADR).

## Suivi
- [x] Implémentation : création du projet depuis ADA
