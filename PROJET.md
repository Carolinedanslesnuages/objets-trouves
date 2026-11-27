# Objets trouvés

**Objectif :** Les agents d'accueil de la mairie enregistrent les objets trouvés (description, lieu, date).
**Stack :** Vue 3 + Node.js (Express) + SQLite, DSFR (modèle ADA `vue-node`)
**DSFR :** oui
**Créé le :** 2026-11-25 par Carolinedanslesnuages

## Lancer le projet
| Action | Commande |
|---|---|
| Lancer l'API | `cd api && npm run start:dev` |
| Lancer le front | `cd front && npm run dev` |

## Stories réalisées
- #2 — Enregistrer un objet trouvé : formulaire (description, lieu, date), contrôles de saisie, confirmation, conservation en base. Fiche : `revues/story-2-enregistrer-un-objet-trouve.md`.
- #3 — Consulter la liste des objets trouvés : la page d'accueil affiche les objets déposés (description, lieu, date), du plus récent au plus ancien, avec un message clair si aucun objet n'est enregistré. Fiche : `revues/story-3-consulter-la-liste-des-objets-trouves.md`.
