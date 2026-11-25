export interface ObjetTrouveSaisi {
  description: string;
  lieu: string;
  dateDecouverte: string;
}

export type ErreursObjetTrouve = Partial<Record<keyof ObjetTrouveSaisi, string>>;

const LONGUEUR_MAXIMALE_TEXTE = 500;

/** Date du jour au format AAAA-MM-JJ (heure locale du serveur). */
export function dateDuJour(maintenant = new Date()): string {
  const mois = String(maintenant.getMonth() + 1).padStart(2, '0');
  const jour = String(maintenant.getDate()).padStart(2, '0');
  return `${maintenant.getFullYear()}-${mois}-${jour}`;
}

function estDateReelle(texte: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texte)) return false;
  const date = new Date(`${texte}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === texte;
}

function erreurTexte(valeur: unknown, nomChamp: string): string | undefined {
  if (typeof valeur !== 'string' || valeur.trim() === '') return `Renseignez ${nomChamp}.`;
  if (valeur.trim().length > LONGUEUR_MAXIMALE_TEXTE) {
    return `Saisissez ${LONGUEUR_MAXIMALE_TEXTE} caractères au plus.`;
  }
  return undefined;
}

/** Vérifie une saisie inconnue : renvoie l'objet propre, ou les erreurs par champ. */
export function validerObjetTrouve(
  corps: unknown,
  aujourdhui = dateDuJour(),
): { objet: ObjetTrouveSaisi } | { erreurs: ErreursObjetTrouve } {
  const saisie = typeof corps === 'object' && corps !== null ? (corps as Record<string, unknown>) : {};
  const erreurs: ErreursObjetTrouve = {};

  const erreurDescription = erreurTexte(saisie.description, 'la description de l’objet');
  if (erreurDescription) erreurs.description = erreurDescription;
  const erreurLieu = erreurTexte(saisie.lieu, 'le lieu de découverte');
  if (erreurLieu) erreurs.lieu = erreurLieu;

  const date = saisie.dateDecouverte;
  if (typeof date !== 'string' || date.trim() === '') {
    erreurs.dateDecouverte = 'Renseignez la date de découverte.';
  } else if (!estDateReelle(date)) {
    erreurs.dateDecouverte = 'Saisissez une date valide, au format jour/mois/année.';
  } else if (date > aujourdhui) {
    erreurs.dateDecouverte = 'La date de découverte ne peut pas être dans le futur.';
  }

  if (Object.keys(erreurs).length > 0) return { erreurs };
  return {
    objet: {
      description: String(saisie.description).trim(),
      lieu: String(saisie.lieu).trim(),
      dateDecouverte: String(date),
    },
  };
}
