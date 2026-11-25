-- Première migration. Chaque évolution de la base = un NOUVEAU fichier, numéroté à la suite
-- (0002-reservations.sql…), jamais une modification d'un fichier déjà fusionné.
-- Exemple :
-- CREATE TABLE reservations (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   salle TEXT NOT NULL,
--   jour TEXT NOT NULL
-- );
SELECT 1;
