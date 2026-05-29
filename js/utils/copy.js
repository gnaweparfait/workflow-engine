/**
 * Copie profonde d'un objet (vu en cours : JSON.stringify / JSON.parse).
 * Utilisé pour dupliquer l'état sans modifier l'original.
 */
export function copierObjet(objet) {
  return JSON.parse(JSON.stringify(objet));
}
