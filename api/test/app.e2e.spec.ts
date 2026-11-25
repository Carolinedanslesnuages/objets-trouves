import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { creerApp } from '../src/app.ts';
import { ouvrirBase } from '../src/base.ts';
import { VERSION_DEV } from '../src/version.ts';

describe('API (e2e)', () => {
  const app = creerApp(ouvrirBase(':memory:'));

  it('répond sous le préfixe /api, base prête', async () => {
    const reponse = await request(app).get('/api').expect(200);
    expect(reponse.body).toEqual({ statut: 'ok', migrations: 1 });
  });

  it.each(['/__version__', '/api/__version__'])('sert la version sur %s, en repli « dev » hors image', async (chemin) => {
    const reponse = await request(app).get(chemin).expect(200);
    expect(reponse.headers['cache-control']).toBe('no-store');
    expect(reponse.body).toEqual(VERSION_DEV);
  });

  it('répond en JSON à une adresse inconnue', async () => {
    const reponse = await request(app).get('/api/inconnue').expect(404);
    expect(reponse.body).toEqual({ erreur: 'Adresse inconnue' });
  });

  it('ne révèle pas la technologie du serveur', async () => {
    const reponse = await request(app).get('/api');
    expect(reponse.headers['x-powered-by']).toBeUndefined();
  });
});
