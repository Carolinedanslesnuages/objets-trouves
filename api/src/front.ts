import express, { type Express } from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * En production (image Docker), l'API sert aussi le front construit : une seule image à déployer.
 * Les adresses qui ne sont ni /api ni un fichier renvoient index.html (navigation de l'application).
 */
export function servirFront(app: Express, dossier: string): void {
  const racine = resolve(dossier);
  const index = join(racine, 'index.html');
  if (!existsSync(index)) throw new Error(`Front construit introuvable : ${index}`);
  app.use(express.static(racine, { index: false, maxAge: '1h' }));
  app.get(/^(?!\/api(\/|$)|\/__version__$).*/, (_requete, reponse) => {
    reponse.set('Cache-Control', 'no-cache').sendFile(index);
  });
}
