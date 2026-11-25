import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { appliquerMigrations, ouvrirBase } from './base.ts';

describe('Base SQLite et migrations', () => {
  const dossiers: string[] = [];
  const dossierMigrations = (fichiers: Record<string, string>) => {
    const dossier = mkdtempSync(join(tmpdir(), 'migrations-'));
    dossiers.push(dossier);
    for (const [nom, contenu] of Object.entries(fichiers)) writeFileSync(join(dossier, nom), contenu);
    return dossier;
  };

  afterEach(() => {
    for (const dossier of dossiers.splice(0)) rmSync(dossier, { recursive: true, force: true });
  });

  it('applique les migrations du projet au démarrage', () => {
    const base = ouvrirBase(':memory:');
    const noms = base.prepare('SELECT nom FROM migrations ORDER BY nom').all().map((ligne) => ligne.nom);
    expect(noms).toContain('0001-initialisation.sql');
  });

  it('applique chaque migration une seule fois, dans l’ordre des noms', () => {
    const dossier = dossierMigrations({
      '0002-ajout.sql': "INSERT INTO salles (nom) VALUES ('Jaune');",
      '0001-salles.sql': 'CREATE TABLE salles (nom TEXT NOT NULL);',
    });
    const base = ouvrirBase(':memory:', dossier);
    expect(appliquerMigrations(base, dossier)).toEqual([]);
    expect(base.prepare('SELECT nom FROM salles').all()).toEqual([{ nom: 'Jaune' }]);
  });

  it('annule une migration en échec sans la marquer appliquée', () => {
    const dossier = dossierMigrations({ '0001-invalide.sql': 'CREATE TABLE ok (id INTEGER); SELECT * FROM absente;' });
    expect(() => ouvrirBase(':memory:', dossier)).toThrow(/0001-invalide.sql/);
  });
});
