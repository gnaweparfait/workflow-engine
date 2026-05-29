import { getSortedColumns } from './columns.js';

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function getColumnLabel(columnId, columns) {
  return columns.find((c) => c.id === columnId)?.label ?? '';
}

export function filterTasksByQuery(tasks, query, columns) {
  if (!query) return tasks;
  const q = query.trim().toLowerCase();
  const sorted = getSortedColumns(columns);

  return tasks.filter((t) => {
    const columnLabel = getColumnLabel(t.columnId, sorted).toLowerCase();
    const columnId = t.columnId.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      columnLabel.includes(q) ||
      columnId.includes(q) ||
      matchColumnKeywords(q, t.columnId)
    );
  });
}

function matchColumnKeywords(query, columnId) {
  const keywords = {
    todo: ['todo', 'faire', 'afaire', 'backlog'],
    'in-progress': ['cours', 'progress', 'wip', 'encours'],
    done: ['termine', 'terminé', 'fini', 'done', 'complete'],
  };
  const list = keywords[columnId] ?? [];
  return list.some((kw) => query.includes(kw) || kw.includes(query));
}

export function filterColumnsByQuery(query, columns) {
  if (!query) return getSortedColumns(columns);
  const q = query.trim().toLowerCase();
  return getSortedColumns(columns).filter((col) => {
    const label = col.label.toLowerCase();
    const id = col.id.toLowerCase();
    return (
      label.includes(q) ||
      id.includes(q) ||
      matchColumnKeywords(q, col.id)
    );
  });
}
