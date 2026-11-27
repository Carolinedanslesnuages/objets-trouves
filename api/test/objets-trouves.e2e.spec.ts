import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { creerApp } from '../src/app.ts';
import { ouvrirBase } from '../src/base.ts';
import { lireObjetTrouve } from '../src/objets-trouves-depot.ts';
import { dateDuJour } from '../src/objets-trouves-validation.ts';

const saisieValide = { description: 'Parapluie bleu', lieu: 'Hall d’accueil', dateDecouverte: '2020-01-15' };

describe('POST /api/objets-trouves (e2e)', () => {
  it('enregistre un objet et le conserve en base', async () => {
    const base = ouvrirBase(':memory:');
    const reponse = await request(creerApp(base)).post('/api/objets-trouves').send(saisieValide).expect(201);
    expect(reponse.body).toEqual({ id: expect.any(Number), ...saisieValide });
    expect(lireObjetTrouve(base, reponse.body.id)).toEqual(reponse.body);
  });

  it('accepte la date du jour', async () => {
    const base = ouvrirBase(':memory:');
    await request(creerApp(base))
      .post('/api/objets-trouves')
      .send({ ...saisieValide, dateDecouverte: dateDuJour() })
      .expect(201);
  });

  it.each(['description', 'lieu', 'dateDecouverte'])('refuse le champ %s vide, sans rien enregistrer', async (champ) => {
    const base = ouvrirBase(':memory:');
    const reponse = await request(creerApp(base))
      .post('/api/objets-trouves')
      .send({ ...saisieValide, [champ]: '' })
      .expect(400);
    expect(reponse.body.erreurs[champ]).toEqual(expect.any(String));
    expect(base.prepare('SELECT COUNT(*) AS nombre FROM objets_trouves').get()).toEqual({ nombre: 0 });
  });

  it('refuse une date dans le futur, sans rien enregistrer', async () => {
    const base = ouvrirBase(':memory:');
    const reponse = await request(creerApp(base))
      .post('/api/objets-trouves')
      .send({ ...saisieValide, dateDecouverte: '2999-01-01' })
      .expect(400);
    expect(reponse.body.erreurs.dateDecouverte).toMatch(/futur/);
    expect(base.prepare('SELECT COUNT(*) AS nombre FROM objets_trouves').get()).toEqual({ nombre: 0 });
  });

  it('refuse un corps absent', async () => {
    const reponse = await request(creerApp(ouvrirBase(':memory:'))).post('/api/objets-trouves').expect(400);
    expect(reponse.body.erreur).toBe('Saisie invalide');
  });

  it('ne se laisse pas piéger par du SQL dans la saisie', async () => {
    const base = ouvrirBase(':memory:');
    const piege = "x'); DROP TABLE objets_trouves; --";
    const reponse = await request(creerApp(base)).post('/api/objets-trouves').send({ ...saisieValide, lieu: piege }).expect(201);
    expect(lireObjetTrouve(base, reponse.body.id)?.lieu).toBe(piege);
  });

  it('renvoie la liste du plus récent au plus ancien, sans être connecté', async () => {
    const base = ouvrirBase(':memory:');
    await request(creerApp(base))
      .post('/api/objets-trouves')
      .send({ ...saisieValide, dateDecouverte: '2026-11-10' })
      .expect(201);
    await request(creerApp(base))
      .post('/api/objets-trouves')
      .send({ ...saisieValide, description: 'Portefeuille noir', lieu: 'Salle des fêtes', dateDecouverte: '2026-11-20' })
      .expect(201);

    const reponse = await request(creerApp(base)).get('/api/objets-trouves').expect(200);
    expect(reponse.body).toEqual({
      objets: [
        { id: expect.any(Number), description: 'Portefeuille noir', lieu: 'Salle des fêtes', dateDecouverte: '2026-11-20' },
        { id: expect.any(Number), description: 'Parapluie bleu', lieu: 'Hall d’accueil', dateDecouverte: '2026-11-10' },
      ],
    });
  });

  it('renvoie une liste vide quand aucun objet n’est enregistré', async () => {
    const reponse = await request(creerApp(ouvrirBase(':memory:'))).get('/api/objets-trouves').expect(200);
    expect(reponse.body).toEqual({ objets: [] });
  });
});
