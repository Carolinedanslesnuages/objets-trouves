# Story #2 — Enregistrer un objet trouvé

En tant qu'agent d'accueil de la mairie, je veux enregistrer un objet trouvé avec sa description, son lieu et sa date, afin de garder une trace de tous les objets déposés à l'accueil.

## Critères d'acceptation et tests qui les prouvent

| Critère | Tests |
|---|---|
| Formulaire : description, lieu, date, trois champs obligatoires | `front/src/views/__tests__/EnregistrerObjetView.spec.ts` — « affiche un seul titre principal et le formulaire à trois champs obligatoires », « refuse la date de demain côté champ » |
| Champ vide ou date future : message clair près du champ | même fichier — « signale chaque champ vide… », « relie le message d'erreur au champ concerné », « refuse une date dans le futur… », « accepte la date du jour » ; côté serveur : `api/src/objets-trouves-validation.spec.ts` et `api/test/objets-trouves.e2e.spec.ts` (refus 400, rien enregistré) |
| Message de confirmation après enregistrement | même fichier front — « envoie la saisie, confirme l'enregistrement et vide le formulaire » ; cas d'échec : « affiche les erreurs renvoyées par le serveur », « annonce une panne du serveur » |
| Objet toujours là après rechargement | `api/test/objets-trouves.e2e.spec.ts` — « enregistre un objet et le conserve en base » (relu depuis la base) |

Test d'accessibilité automatique (`violationsAccessibilite`) : formulaire vierge, avec erreurs, après confirmation.

## Base de données — à relire

Nouvelle migration `api/migrations/0002-objets-trouves.sql` : table `objets_trouves` (description, lieu, date de découverte, date d'enregistrement). Aucune migration existante modifiée. Requêtes préparées.

## Accessibilité

Mis en œuvre : composants DSFR (champ, bouton, alerte), étiquettes visibles liées aux champs, champs obligatoires signalés (« * » + phrase d'explication + attribut `required`), erreurs en texte relié au champ, confirmation et nombre d'erreurs dans une zone `role="status"`, un seul `h1`, titre de page propre à chaque page, lien depuis l'accueil, tout au clavier.

À vérifier par un humain :
- Lecteur d'écran : la confirmation et le « Le formulaire contient N erreurs » sont bien annoncés ; chaque erreur est lue avec son champ.
- Focus visible et ordre de tabulation sur l'écran réel ; affichage à 320 px et à 200 % de zoom.
- Saisie de la date au clavier selon le navigateur (le champ date natif varie).
- Le message d'erreur n'est pas porté que par la couleur (texte présent, à confirmer visuellement).
- Après une erreur, le focus reste sur le bouton : à juger avec les utilisateurs.

## Périmètre

- Ajouté : route et règles API, migration, écran, service, tests, lien sur l'accueil, titre de page par route.
- Modifié : `app.ts` (branchement de la route), test de l'accueil (route ajoutée, évite un avertissement), test e2e existant (nombre de migrations 1 → 2).
- Non touché : liste (#3) et signalement (#4). Pas de store Pinia (donnée propre à l'écran).
- À signaler : le contrôle CI « Accessibilité RGAA (pages construites) » liste les pages dans `.github/workflows/ci.yml`, que je ne peux pas modifier. Un développeur doit y ajouter `/objets-trouves/nouveau`.
- La date « du jour » suit l'heure du serveur côté API, celle du navigateur côté écran : écart possible autour de minuit.

## Contrôles

- API : lint, tests (16), tests e2e (16), build : OK.
- Front : oxlint, eslint, type-check, tests (14), build : OK.
