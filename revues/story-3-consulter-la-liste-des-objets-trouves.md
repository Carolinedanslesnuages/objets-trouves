# Story #3 — Consulter la liste des objets trouvés

En tant qu'habitant, je veux consulter la liste des objets trouvés, afin de vérifier si l'objet que j'ai perdu a été retrouvé.

## Critères d'acceptation et tests qui les prouvent

| Critère | Tests |
|---|---|
| La liste affiche pour chaque objet sa description, son lieu et sa date, du plus récent au plus ancien | `api/test/objets-trouves.e2e.spec.ts` — « renvoie la liste du plus récent au plus ancien, sans être connecté » (ordre de la réponse serveur) ; `front/src/views/__tests__/HomeView.spec.ts` — « affiche les objets du plus récent au plus ancien, dans un tableau avec en-têtes » (ordre affiché, colonnes Description / Lieu de découverte / Date de découverte) |
| Si aucun objet n'est enregistré, un message l'indique clairement | `api/test/objets-trouves.e2e.spec.ts` — « renvoie une liste vide quand aucun objet n'est enregistré » ; même fichier front — « affiche un message clair quand aucun objet n'est enregistré » (message dans une zone `role="status"`) |
| La liste est accessible sans connexion | même fichier front — « laisse le lien d'enregistrement accessible sans aucune étape de connexion » ; côté API, la route `GET /api/objets-trouves` ne demande aucune session, vérifié par les tests e2e qui l'appellent sans authentification |

Test d'accessibilité automatique (`violationsAccessibilite`) : page avec des objets, page sans objet.

## API

- Nouvelle route `GET /api/objets-trouves` : renvoie `{ "objets": [...] }`, classés par date de découverte décroissante, puis par date d'enregistrement décroissante (même date).
- Tri fait dans la requête SQL préparée (aucune concaténation), dans le dépôt.
- Aucune évolution de la base : la table existante suffit. Aucune migration ajoutée.

## Accessibilité

Mis en œuvre : un seul `h1`, titre de page (accueil) déjà explicite, tableau DSFR (`DsfrTable`) avec titre et en-têtes de colonnes, message « aucun objet » annoncé comme message de statut (`role="status"`), lien d'enregistrement à l'intitulé explicite, composants DSFR uniquement.

À vérifier par un humain :
- Lecteur d'écran : le message « Aucun objet n'est enregistré pour le moment. » est bien annoncé quand la liste est vide.
- Lecture du tableau : la légende « Objets trouvés déposés à l'accueil » et les en-têtes de colonnes sont bien restitués avec le contenu de chaque ligne.
- Focus visible et ordre de tabulation sur l'écran réel ; affichage à 320 px et à 200 % de zoom (le tableau large doit rester consultable).
- Le lien « Enregistrez-le » hors contexte reste compréhensible (intitulé jugé acceptable ; à confirmer).

La page d'accueil (`/`) est déjà dans la liste des pages du contrôle CI « Accessibilité RGAA (pages construites) » : elle sera vérifiée automatiquement dans un vrai navigateur.

## Périmètre

- Ajouté : route de lecture, fonction du dépôt (liste), service front de lecture, écran d'accueil devenu la liste, tests (2 API, 6 front dont 2 accessibilité).
- Modifié : `HomeView.vue` (contenu), services et dépôt existants (ajout d'une fonction, pas de refactor), tests existants enrichis.
- Non touché : page d'enregistrement (#2), signalement (#4), fichiers `.github/` et `charts/`, aucune migration.
- Pas de store Pinia : la liste est lue par un seul écran, elle ne survit pas à un changement de page pour l'instant.
- Point d'attention pour le PO : la liste est publique, sans connexion. Rappeler aux agents d'éviter les descriptions trop précises (numéros de pièce d'identité, détails de clés…) dans le formulaire d'enregistrement.

## Contrôles

- API : lint, tests (16), tests e2e (18), build : OK.
- Front : oxlint, eslint, type-check, tests (18 dont 6 accessibilité automatique pour la liste), build : OK.
- Avertissements connus du build front (media queries IE du DSFR) : déjà gérés par la configuration du projet, sans effet.
