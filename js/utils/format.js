import {
  DEFAULT_PRIORITY,
  DEFAULT_TASK_COLOR,
  PRIORITIES,
  TASK_CARD_COLORS,
} from '../core/constants.js';

/** Métadonnées de priorité pour l'affichage */
export function getPriorityMeta(priority) {
  if (PRIORITIES[priority]) {
    return PRIORITIES[priority];
  }
  return PRIORITIES[DEFAULT_PRIORITY];
}

/** Formate une date pour l'affichage (méthode vue en cours sur Date) */
export function formatTaskDate(value) {
  if (!value) return null;
  var date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Normalise une tâche (rétrocompatibilité localStorage) */
export function normalizeTask(task) {
  var source = task || {};
  var color =
    TASK_CARD_COLORS[source.color] ? source.color : DEFAULT_TASK_COLOR;
  var priority =
    PRIORITIES[source.priority] ? source.priority : DEFAULT_PRIORITY;

  return Object.assign(
    {
      description: '',
      priority: DEFAULT_PRIORITY,
      dueDate: null,
      color: DEFAULT_TASK_COLOR,
    },
    source,
    {
      priority: priority,
      color: color,
    }
  );
}
