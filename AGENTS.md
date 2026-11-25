# Objets trouvés — instructions pour les agents de code

Lu par Codex, OpenCode, Cursor, Copilot, Gemini CLI… ; `CLAUDE.md` l'importe pour Claude Code.

Objectif : Les agents d'accueil de la mairie enregistrent les objets trouvés (description, lieu, date).

## Conventions
- **Noms explicites** : chaque variable, fonction, paramètre ou classe dit ce qu'il contient
  ou fait, en toutes lettres (`salleLibre`, `reservationsDuJour`, `violation`), jamais `el`,
  `x`, `s`, `tmp`, `data2`. Seuls les noms imposés par les bibliothèques restent tels quels
  (`vi`, `expect`, `app`…). Contrôlé par le lint (`id-length`, 3 caractères minimum) : la CI échoue sinon.
- API (`api/`) : Node.js 24 + Express 5, TypeScript exécuté directement par Node (pas de
  compilation ; imports avec suffixe `.ts`, pas d'`enum` ni de `namespace`). Une route par
  domaine métier dans `src/routes/<domaine>.ts`, branchée dans `src/app.ts`. Routes sous `/api`,
  réponses JSON ; erreurs en `{ "erreur": "message clair" }`.
- Validation de chaque entrée (`req.body`, `req.params`, `req.query`) avant usage : vérifier
  types et valeurs, répondre 400 avec un message clair. Jamais de `any`.
- Données : SQLite intégré à Node.js (`node:sqlite`), un fichier (`api/donnees/`, jamais commité).
  Requêtes **toujours préparées** avec paramètres (`base.prepare('… WHERE id = ?').get(id)`),
  jamais de valeur concaténée dans le SQL.
- **Toute évolution de la base = un nouveau fichier `api/migrations/000N-<sujet>.sql`**, appliqué
  au démarrage ; ne jamais modifier une migration déjà fusionnée. À signaler pour relecture.
- Tests API : `src/**/*.spec.ts` (règles, base `:memory:`) et `test/*.e2e.spec.ts` (routes, supertest).
- Front (`front/`) : un dossier `src/views/` par écran, appels API dans `src/services/`,
  `<script setup lang="ts">`.
- **Pinia** (installé et activé dans `src/main.ts`) : créer un store `src/stores/<domaine>.ts`
  (syntaxe « setup store ») dès qu'une donnée sert à plusieurs écrans ou composants, doit
  survivre à un changement de page, ou est filtrée / modifiée à plusieurs endroits (ex. : la
  liste des prêts, l'utilisateur courant, un panier). Le store appelle les services ; les écrans
  lisent le store. Une donnée propre à un seul écran reste un `ref` local, sans store. Chaque
  store a ses tests (`src/stores/__tests__/`).
- Interface : composants DSFR (`Dsfr*` de `@gouvminint/vue-dsfr`), pas de HTML maison
  quand un composant existe. Un seul `h1` par page.
- Tout critère d'acceptation se traduit par au moins un test (Vitest côté API et côté front).

## Déploiement
- `Dockerfile` : image de production unique (l'API sert aussi le front construit, `src/front.ts`).
  Elle est construite et démarrée par la CI à chaque demande (« Image et chart »). Un nouveau
  dossier lu par l'application à l'exécution doit y être copié.
- `charts/app/` (présent si le projet est déployé) : chart Helm générique. **Réservé aux
  développeurs et à l'équipe infra : ne pas le modifier.** Les valeurs d'un environnement
  (registre, adresse, stockage) sont fournies hors du dépôt.

## Accessibilité (RGAA) — les bases, toujours

Le service doit être utilisable par tous (RGAA 4, obligatoire dans l'administration). À chaque
écran ou composant, sans exception :

- **Composants DSFR** d'abord (`Dsfr*`) : ils sont déjà accessibles ; ne pas recoder un bouton,
  un champ ou une alerte en HTML maison. Ne jamais changer leurs couleurs (contrastes du DSFR).
- **Page** : `lang="fr"`, un titre de page (`<title>`) qui dit où l'on est, un seul `h1`, des
  titres `h2`, `h3`… sans saut de niveau ; liens d'évitement conservés.
- **Images** : alternative qui dit l'information (`alt="…"`), ou `alt=""` si décorative.
- **Formulaires** : chaque champ a une étiquette visible liée ; champs obligatoires signalés ;
  erreurs écrites en clair et reliées au champ (`DsfrInputGroup` avec `error-message`).
- **Clavier** : tout ce qui se fait à la souris se fait au clavier, dans un ordre logique, avec
  un focus visible ; jamais de `tabindex` positif ; un élément cliquable est un `<button>` ou un lien.
- **Liens et boutons** : intitulé compréhensible hors contexte (jamais « cliquez ici ») ; un lien
  qui ouvre une nouvelle fenêtre le dit.
- **Information** : jamais par la couleur seule (texte ou icône en plus) ; messages qui
  apparaissent sans rechargement annoncés (`role="status"` ou `aria-live`).
- **Tableaux de données** : un titre et des en-têtes de colonnes.
- **Animations** : respectent `prefers-reduced-motion`.

**Référentiel complet** (DINUM, RGAA 4.1.2, 106 critères et leurs tests) :
`ressources/accessibilite/rgaa-4.1.2/README.md` pour l'index, puis le fichier du thème concerné.

Vérifié automatiquement : le **lint** (`eslint-plugin-vuejs-accessibility`) refuse une image sans
alternative, un champ sans étiquette, un clic sans clavier… et chaque écran a un **test axe-core**
(`violationsAccessibilite`). Ces outils couvrent environ un tiers du RGAA : le reste se vérifie
à la main et se note dans la fiche de relecture (« à vérifier par un humain »).

En CI, le contrôle **« Accessibilité RGAA (pages construites) »** ouvre les pages dans un vrai
navigateur : lien d'évitement, focus visible, affichage à 320 px et zoomé, espacement du texte, et
axe-core, chaque constat rangé par critère du RGAA. Une nouvelle page s'ajoute à la liste `pages:`
de ce contrôle (`.github/workflows/ci.yml`), avec son adresse (ex. `/reservations`). Un défaut
accepté en connaissance de cause s'inscrit dans `.emmanuelle-reference.json`, jamais pour faire
passer une PR : on le corrige.

## Commandes
| Action | Commande |
|---|---|
| Lancer l'API | `cd api && npm run start:dev` (préfixe `/api`, port 3000, base créée au démarrage) |
| Lancer le front | `cd front && npm run dev` (proxy `/api` vers le port 3000) |
| Tests | `cd api && npm test && npm run test:e2e && cd ../front && npm run test:unit -- --run` |
| Lint | `cd api && npm run lint && cd ../front && npm run lint` |
| Types / compilation | `cd api && npm run build && cd ../front && npm run type-check` |

## Messages de commit (release-please)
Conventional Commits, versions SemVer calculées par release-please (jamais à la main) :
`fix: …` → correctif (0.2.0 → 0.2.1), `feat: …` → fonctionnalité (0.2.0 → 0.3.0),
`feat!: …` ou `BREAKING CHANGE:` → changement incompatible (majeure ; mineure avant 1.0.0),
`test:`, `docs:`, `chore:`, `refactor:` → sans nouvelle version. Fusion en squash : le
**titre de la PR** devient le commit de `main` (contrôle « Titre de PR » en CI). Story issue
d'une issue GitHub : `Closes #<numéro>` dans le corps.

## Règles absolues
- **Un fichier, une responsabilité** : au plus 400 lignes non vides par fichier de code, 600 par fichier de test (contrôle « Taille des fichiers » en CI). Découper par responsabilité, jamais une fonction par fichier ; un fichier déjà trop long ne grossit plus.
- Ne jamais modifier `.github/` ni `charts/`.
- Aucune donnée réelle, aucun secret dans le dépôt (gitleaks bloque en CI, et en local une fois `pre-commit install` lancé ; `--no-verify` interdit).
- Une branche par story (`story/…`) ou par bug (`fix/…`) ; jamais de fusion par l'agent.
- Les décisions d'architecture sont tracées dans `docs/adr/`.
