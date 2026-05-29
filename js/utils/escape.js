/**
 * Échappe le HTML pour éviter les injections lors du rendu dynamique.
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
