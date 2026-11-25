import { describe, expect, it } from 'vitest';
import { dateDuJour, validerObjetTrouve } from './objets-trouves-validation.ts';

const AUJOURDHUI = '2026-11-25';
const saisieValide = { description: 'Parapluie bleu', lieu: 'Hall d’accueil', dateDecouverte: '2026-11-20' };

describe('Validation d’un objet trouvé', () => {
  it('accepte une saisie complète et retire les espaces autour', () => {
    const resultat = validerObjetTrouve({ ...saisieValide, description: '  Parapluie bleu ' }, AUJOURDHUI);
    expect(resultat).toEqual({ objet: saisieValide });
  });

  it.each(['description', 'lieu', 'dateDecouverte'])('refuse le champ %s vide', (champ) => {
    const resultat = validerObjetTrouve({ ...saisieValide, [champ]: '   ' }, AUJOURDHUI);
    expect(resultat).toHaveProperty(['erreurs', champ]);
  });

  it('refuse un corps absent : les trois champs sont signalés', () => {
    const resultat = validerObjetTrouve(undefined, AUJOURDHUI);
    expect(resultat).toHaveProperty('erreurs.description');
    expect(resultat).toHaveProperty('erreurs.lieu');
    expect(resultat).toHaveProperty('erreurs.dateDecouverte');
  });

  it('refuse des valeurs qui ne sont pas du texte', () => {
    const resultat = validerObjetTrouve({ description: 12, lieu: {}, dateDecouverte: 5 }, AUJOURDHUI);
    expect(resultat).toHaveProperty('erreurs.description');
    expect(resultat).toHaveProperty('erreurs.lieu');
    expect(resultat).toHaveProperty('erreurs.dateDecouverte');
  });

  it('refuse une date dans le futur', () => {
    const resultat = validerObjetTrouve({ ...saisieValide, dateDecouverte: '2026-11-26' }, AUJOURDHUI);
    expect(resultat).toEqual({ erreurs: { dateDecouverte: 'La date de découverte ne peut pas être dans le futur.' } });
  });

  it('accepte la date du jour', () => {
    expect(validerObjetTrouve({ ...saisieValide, dateDecouverte: AUJOURDHUI }, AUJOURDHUI)).toHaveProperty('objet');
  });

  it.each(['2026-02-30', '25/11/2026', 'hier'])('refuse la date invalide %s', (date) => {
    const resultat = validerObjetTrouve({ ...saisieValide, dateDecouverte: date }, AUJOURDHUI);
    expect(resultat).toHaveProperty('erreurs.dateDecouverte');
  });

  it('refuse un texte trop long', () => {
    const resultat = validerObjetTrouve({ ...saisieValide, lieu: 'a'.repeat(501) }, AUJOURDHUI);
    expect(resultat).toHaveProperty('erreurs.lieu');
  });

  it('donne la date du jour au format AAAA-MM-JJ', () => {
    expect(dateDuJour(new Date(2026, 10, 5))).toBe('2026-11-05');
  });
});
