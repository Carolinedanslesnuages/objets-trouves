import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/** Dossier des migrations SQL, appliquées dans l'ordre de leur nom. */
export const DOSSIER_MIGRATIONS = join(import.meta.dirname, '..', 'migrations');

/** Base SQLite intégrée à Node.js : un fichier, ou « :memory: » pour les tests. */
export function ouvrirBase(fichier: string, dossierMigrations = DOSSIER_MIGRATIONS): DatabaseSync {
  if (fichier !== ':memory:') mkdirSync(dirname(fichier), { recursive: true });
  const base = new DatabaseSync(fichier);
  base.exec('PRAGMA foreign_keys = ON');
  appliquerMigrations(base, dossierMigrations);
  return base;
}

/** Applique une seule fois chaque fichier .sql du dossier, dans l'ordre alphabétique. */
export function appliquerMigrations(base: DatabaseSync, dossierMigrations: string): string[] {
  base.exec('CREATE TABLE IF NOT EXISTS migrations (nom TEXT PRIMARY KEY, appliquee_le TEXT NOT NULL)');
  const dejaAppliquees = new Set(
    base.prepare('SELECT nom FROM migrations').all().map((ligne) => String(ligne.nom)),
  );
  const nouvelles = readdirSync(dossierMigrations)
    .filter((nom) => nom.endsWith('.sql') && !dejaAppliquees.has(nom))
    .sort();
  for (const nom of nouvelles) {
    base.exec('BEGIN');
    try {
      base.exec(readFileSync(join(dossierMigrations, nom), 'utf8'));
      base.prepare('INSERT INTO migrations (nom, appliquee_le) VALUES (?, ?)').run(nom, new Date().toISOString());
      base.exec('COMMIT');
    } catch (erreur) {
      base.exec('ROLLBACK');
      throw new Error(`Migration ${nom} en échec`, { cause: erreur });
    }
  }
  return nouvelles;
}
