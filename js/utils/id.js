/** Identifiant unique pour une tâche */
export function generateTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Identifiant unique pour une colonne */
export function generateColumnId() {
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** @deprecated alias */
export function generateId() {
  return generateTaskId();
}
