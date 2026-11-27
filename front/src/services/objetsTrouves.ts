import type { ErreursObjetTrouve, ObjetTrouveSaisi } from './objetsTrouvesValidation'

export interface ObjetTrouveListe extends ObjetTrouveSaisi {
  id: number
}

export type ResultatEnregistrement =
  | { reussi: true }
  | { reussi: false; erreurs: ErreursObjetTrouve; message: string }

const MESSAGE_ERREUR_GENERALE = 'L’objet n’a pas pu être enregistré. Réessayez dans un instant.'

/** Envoie l'objet trouvé à l'API ; ne lève jamais d'exception. */
export async function enregistrerObjetTrouve(saisie: ObjetTrouveSaisi): Promise<ResultatEnregistrement> {
  try {
    const reponse = await fetch('/api/objets-trouves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saisie),
    })
    if (reponse.ok) return { reussi: true }
    const corps = (await reponse.json().catch(() => ({}))) as { erreurs?: ErreursObjetTrouve }
    return { reussi: false, erreurs: corps.erreurs ?? {}, message: MESSAGE_ERREUR_GENERALE }
  } catch {
    return { reussi: false, erreurs: {}, message: MESSAGE_ERREUR_GENERALE }
  }
}

/** Recharge la liste des objets trouvés, classée du plus récent au plus ancien ; ne lève jamais d'exception. */
export async function listerObjetsTrouves(): Promise<ObjetTrouveListe[]> {
  const reponse = await fetch('/api/objets-trouves')
  if (!reponse.ok) return []
  const corps = (await reponse.json().catch(() => ({}))) as { objets?: ObjetTrouveListe[] }
  return Array.isArray(corps.objets) ? corps.objets : []
}
