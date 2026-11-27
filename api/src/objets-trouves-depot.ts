import type { DatabaseSync } from 'node:sqlite';
import type { ObjetTrouveSaisi } from './objets-trouves-validation.ts';

export interface ObjetTrouve extends ObjetTrouveSaisi {
  id: number;
}

/** Enregistre un objet trouvé (requête préparée) et le renvoie tel que conservé. */
export function enregistrerObjetTrouve(base: DatabaseSync, objet: ObjetTrouveSaisi): ObjetTrouve {
  const resultat = base
    .prepare('INSERT INTO objets_trouves (description, lieu, date_decouverte, enregistre_le) VALUES (?, ?, ?, ?)')
    .run(objet.description, objet.lieu, objet.dateDecouverte, new Date().toISOString());
  return { id: Number(resultat.lastInsertRowid), ...objet };
}

/** Relit un objet trouvé conservé, ou undefined s'il n'existe pas. */
export function lireObjetTrouve(base: DatabaseSync, identifiant: number): ObjetTrouve | undefined {
  const ligne = base
    .prepare('SELECT id, description, lieu, date_decouverte FROM objets_trouves WHERE id = ?')
    .get(identifiant);
  if (!ligne) return undefined;
  return {
    id: Number(ligne.id),
    description: String(ligne.description),
    lieu: String(ligne.lieu),
    dateDecouverte: String(ligne.date_decouverte),
  };
}

/** Liste les objets conservés, du plus récent au plus ancien (date de découverte, puis enregistrement). */
export function listerObjetsTrouves(base: DatabaseSync): ObjetTrouve[] {
  const lignes = (base
    .prepare(
      'SELECT id, description, lieu, date_decouverte FROM objets_trouves ORDER BY date_decouverte DESC, enregistre_le DESC',
    )
    .all() ?? []) as Array<{ id: number | bigint; description: string; lieu: string; date_decouverte: string }>;
  return lignes.map((ligne) => ({
    id: Number(ligne.id),
    description: String(ligne.description),
    lieu: String(ligne.lieu),
    dateDecouverte: String(ligne.date_decouverte),
  }));
}
