import { Router } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import { enregistrerObjetTrouve } from '../objets-trouves-depot.ts';
import { validerObjetTrouve } from '../objets-trouves-validation.ts';

/** Routes des objets trouvés, montées sous /api/objets-trouves. */
export function routesObjetsTrouves(base: DatabaseSync): Router {
  const routeur = Router();

  routeur.post('/', (requete, reponse) => {
    const verification = validerObjetTrouve(requete.body);
    if ('erreurs' in verification) {
      reponse.status(400).json({ erreur: 'Saisie invalide', erreurs: verification.erreurs });
      return;
    }
    reponse.status(201).json(enregistrerObjetTrouve(base, verification.objet));
  });

  return routeur;
}
