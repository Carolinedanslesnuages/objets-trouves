import request from 'supertest';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { creerApp } from '../src/app.ts';
import { ouvrirBase } from '../src/base.ts';
import { servirFront } from '../src/front.ts';

const frontConstruit = () => {
  const dossier = mkdtempSync(join(tmpdir(), 'front-'));
  writeFileSync(join(dossier, 'index.html'), '<!doctype html><title>Application</title>');
  mkdirSync(join(dossier, 'assets'));
  writeFileSync(join(dossier, 'assets', 'app.js'), 'console.log(1)');
  return dossier;
};

describe('Front servi par l’API (image de production)', () => {
  const app = creerApp(ouvrirBase(':memory:'));
  servirFront(app, frontConstruit());

  it('sert les fichiers du front et index.html pour toute page de l’application', async () => {
    expect((await request(app).get('/assets/app.js').expect(200)).text).toBe('console.log(1)');
    for (const page of ['/', '/mes-emprunts', '/reponses']) {
      expect((await request(app).get(page).expect(200)).text).toContain('<title>Application</title>');
    }
  });

  it('laisse /api et /__version__ à l’API', async () => {
    expect((await request(app).get('/api').expect(200)).body.statut).toBe('ok');
    expect((await request(app).get('/api/inconnue').expect(404)).body).toEqual({ erreur: 'Adresse inconnue' });
    expect((await request(app).get('/__version__').expect(200)).body.version).toBe('dev');
  });

  it('refuse de démarrer sans front construit', () => {
    expect(() => servirFront(creerApp(ouvrirBase(':memory:')), join(tmpdir(), 'absent'))).toThrow(/introuvable/);
  });
});
