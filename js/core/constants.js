/** Clé de persistance localStorage */
export const STORAGE_KEY = 'workflow-engine:state';
export const THEME_STORAGE_KEY = 'workflow-engine:theme';

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

/** Colonnes par défaut (migration & premier lancement) */
export const DEFAULT_COLUMNS = [
  { id: 'todo', label: 'À faire', accent: '#6366f1', order: 0 },
  { id: 'in-progress', label: 'En cours', accent: '#f59e0b', order: 1 },
  { id: 'done', label: 'Terminé', accent: '#22c55e', order: 2 },
];

export const DEFAULT_COLUMN_ACCENT = '#6366f1';

/** Priorités */
export const PRIORITIES = {
  low: { label: 'Basse', class: 'badge--low' },
  medium: { label: 'Moyenne', class: 'badge--medium' },
  high: { label: 'Haute', class: 'badge--high' },
  urgent: { label: 'Urgente', class: 'badge--urgent' },
};

export const DEFAULT_PRIORITY = 'medium';

/** Couleurs de carte (inspiré du groupe — Collection projet JS) */
export const TASK_CARD_COLORS = {
  default: { label: 'Par défaut', class: '' },
  red: { label: 'Rouge', class: 'card--color-red' },
  blue: { label: 'Bleu', class: 'card--color-blue' },
  green: { label: 'Vert', class: 'card--color-green' },
  yellow: { label: 'Jaune', class: 'card--color-yellow' },
};

export const DEFAULT_TASK_COLOR = 'default';

export const DEFAULT_STATE = {
  tasks: [],
  columns: DEFAULT_COLUMNS.map((c) => ({ ...c })),
  searchQuery: '',
};

export const EVENTS = {
  STATE_CHANGED: 'stateChanged',
  TASK_CREATED: 'taskCreated',
  TASK_UPDATED: 'taskUpdated',
  TASK_DELETED: 'taskDeleted',
  TASK_MOVED: 'taskMoved',
  COLUMN_CREATED: 'columnCreated',
  COLUMN_UPDATED: 'columnUpdated',
  COLUMN_DELETED: 'columnDeleted',
  SEARCH_CHANGED: 'searchChanged',
  NOTIFY: 'notify',
  TASK_EDIT_REQUEST: 'taskEditRequest',
  TASK_CREATE_REQUEST: 'taskCreateRequest',
  COLUMN_EDIT_REQUEST: 'columnEditRequest',
  COLUMN_CREATE_REQUEST: 'columnCreateRequest',
  HISTORY_CHANGED: 'historyChanged',
};

export const TEMPLATE_IDS = {
  COLUMN: 'tpl-column',
  TASK_CARD: 'tpl-task-card',
  TOAST: 'tpl-toast',
  EMPTY_COLUMN: 'tpl-empty-column',
};

export const SELECTORS = {
  BOARD: '#board',
  CARD: '.card',
  COLUMN: '.column',
  COLUMN_DROP: '.column__cards',
  DELETE_BTN: '[data-action="delete"]',
  EDIT_BTN: '[data-action="edit"]',
  EDIT_COLUMN_BTN: '[data-action="edit-column"]',
  DELETE_COLUMN_BTN: '[data-action="delete-column"]',
  TASK_COUNT: '#task-count',
  MODAL: '#task-modal',
  COLUMN_MODAL: '#column-modal',
  MODAL_FORM: '#task-form',
  COLUMN_MODAL_FORM: '#column-form',
  MODAL_TITLE: '#modal-title',
  COLUMN_MODAL_TITLE: '#column-modal-title',
  BTN_NEW_TASK: '#btn-new-task',
  BTN_NEW_COLUMN: '#btn-new-column',
  BTN_SAVE_ALL: '#btn-save-all',
  BTN_THEME_TOGGLE: '#btn-theme-toggle',
  BTN_UNDO: '#btn-undo',
  BTN_REDO: '#btn-redo',
  BTN_EXPORT: '#btn-export',
  BTN_IMPORT: '#btn-import',
  IMPORT_FILE: '#import-file-input',
};

export const HISTORY_LIMIT = 50;
