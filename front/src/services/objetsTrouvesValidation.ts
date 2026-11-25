export interface ObjetTrouveSaisi {
  description: string
  lieu: string
  dateDecouverte: string
}

export type ErreursObjetTrouve = Partial<Record<keyof ObjetTrouveSaisi, string>>

/** Date du jour au format AAAA-MM-JJ (heure locale du navigateur). */
export function dateDuJour(maintenant = new Date()): string {
  const mois = String(maintenant.getMonth() + 1).padStart(2, '0')
  const jour = String(maintenant.getDate()).padStart(2, '0')
  return `${maintenant.getFullYear()}-${mois}-${jour}`
}

/** Erreurs de la saisie, champ par champ ; objet vide si tout est correct. */
export function erreursDeLaSaisie(saisie: ObjetTrouveSaisi, aujourdhui = dateDuJour()): ErreursObjetTrouve {
  const erreurs: ErreursObjetTrouve = {}
  if (saisie.description.trim() === '') erreurs.description = 'Renseignez la description de l’objet.'
  if (saisie.lieu.trim() === '') erreurs.lieu = 'Renseignez le lieu de découverte.'
  if (saisie.dateDecouverte.trim() === '') {
    erreurs.dateDecouverte = 'Renseignez la date de découverte.'
  } else if (saisie.dateDecouverte > aujourdhui) {
    erreurs.dateDecouverte = 'La date de découverte ne peut pas être dans le futur.'
  }
  return erreurs
}
