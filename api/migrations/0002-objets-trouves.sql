-- Objets trouvés déposés à l'accueil : description, lieu, date de découverte (AAAA-MM-JJ).
CREATE TABLE objets_trouves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  lieu TEXT NOT NULL,
  date_decouverte TEXT NOT NULL,
  enregistre_le TEXT NOT NULL
);
