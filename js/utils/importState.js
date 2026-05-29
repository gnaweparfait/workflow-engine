import { DEFAULT_STATE } from '../core/constants.js';
import { normalizeColumns, reassignOrphanTasks } from './columns.js';
import { normalizeTask } from './format.js';

/**
 * Convertit un export JSON (format principal ou legacy groupe)
 * vers la structure { tasks[], columns[], searchQuery }.
 */
export function parseImportedState(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Fichier JSON invalide');
  }

  if (Array.isArray(raw.columns) && raw.columns.some((c) => Array.isArray(c.tasks))) {
    return convertLegacyGroupState(raw);
  }

  const columns = normalizeColumns(raw.columns ?? DEFAULT_STATE.columns);
  const tasks = reassignOrphanTasks(
    (raw.tasks ?? []).map((t) =>
      normalizeTask({
        ...t,
        title: t.title ?? t.text ?? 'Sans titre',
        columnId: t.columnId ?? t.column ?? columns[0]?.id,
      })
    ),
    columns
  );

  return {
    ...DEFAULT_STATE,
    searchQuery: typeof raw.searchQuery === 'string' ? raw.searchQuery : '',
    columns,
    tasks,
  };
}

function convertLegacyGroupState(raw) {
  const tasks = [];
  const columns = raw.columns.map((col, index) => {
    const id = col.id ?? `col-${index}`;
    (col.tasks ?? []).forEach((t) => {
      tasks.push(
        normalizeTask({
          id: t.id,
          title: t.text ?? t.title ?? 'Sans titre',
          description: t.description ?? '',
          priority: t.priority ?? 'medium',
          dueDate: t.date ? new Date(t.date).toISOString() : null,
          color: t.color ?? 'default',
          columnId: id,
          createdAt: t.createdAt ?? Date.now(),
        })
      );
    });
    return {
      id,
      label: col.title ?? col.label ?? 'Colonne',
      accent: col.accent ?? '#6366f1',
      order: typeof col.order === 'number' ? col.order : index,
    };
  });

  return {
    ...DEFAULT_STATE,
    searchQuery: '',
    columns: normalizeColumns(columns),
    tasks: reassignOrphanTasks(tasks, columns),
  };
}
