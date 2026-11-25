import { creerApp } from './app.ts';
import { ouvrirBase } from './base.ts';
import { servirFront } from './front.ts';

const base = ouvrirBase(process.env.FICHIER_BASE ?? 'donnees/app.db');
const port = Number(process.env.PORT ?? 3000);

const app = creerApp(base);
// Image de production : le front construit est servi par l'API (voir Dockerfile).
if (process.env.DOSSIER_FRONT) servirFront(app, process.env.DOSSIER_FRONT);

app.listen(port, () => {
  console.log(`API prête sur http://localhost:${port}/api`);
});
