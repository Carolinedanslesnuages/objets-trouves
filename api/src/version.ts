import { readFileSync } from 'node:fs';

/** Contrat repo-version-json (format Dockerflow) : le fichier de l'image, sinon « dev ». */
export const VERSION_DEV = {
  source: '',
  version: 'dev',
  commit: '',
  build: '',
  code_date: '',
  changes: [],
  history: [],
};

export function lireVersion(fichier = process.env.VERSION_JSON ?? '/app/version.json'): unknown {
  try {
    return JSON.parse(readFileSync(fichier, 'utf8'));
  } catch {
    return { ...VERSION_DEV };
  }
}
