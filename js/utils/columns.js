import { DEFAULT_COLUMNS } from '../core/constants.js';

/** Colonnes triées par ordre d'affichage */
export function getSortedColumns(columns) {
  return [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Normalise les colonnes chargées depuis localStorage */
export function normalizeColumns(columns) {
  var liste = [];

  if (Array.isArray(columns) && columns.length > 0) {
    for (var i = 0; i < columns.length; i++) {
      var col = columns[i];
      liste.push({
        id: col.id,
        label: col.label || 'Sans titre',
        accent: col.accent || '#6366f1',
        order: typeof col.order === 'number' ? col.order : i,
      });
    }
  }

  /* Rétablit les colonnes Kanban par défaut si elles manquent (ex. ancien localStorage) */
  var ids = {};
  for (var j = 0; j < liste.length; j++) {
    ids[liste[j].id] = true;
  }
  for (var k = 0; k < DEFAULT_COLUMNS.length; k++) {
    var def = DEFAULT_COLUMNS[k];
    if (!ids[def.id]) {
      liste.push({
        id: def.id,
        label: def.label,
        accent: def.accent,
        order: def.order,
      });
    }
  }

  if (liste.length === 0) {
    return DEFAULT_COLUMNS.map(function (c) {
      return { id: c.id, label: c.label, accent: c.accent, order: c.order };
    });
  }

  return getSortedColumns(liste);
}

/** Réassigne les tâches orphelines vers la première colonne */
export function reassignOrphanTasks(tasks, columns) {
  if (!columns.length) return tasks;
  const validIds = new Set(columns.map((c) => c.id));
  const fallback = columns[0].id;
  return tasks.map((t) =>
    validIds.has(t.columnId) ? t : { ...t, columnId: fallback }
  );
}
