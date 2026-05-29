import { TEMPLATE_IDS, TASK_CARD_COLORS } from '../core/constants.js';
import { formatTaskDate, getPriorityMeta, normalizeTask } from './format.js';

export function cloneTemplate(templateId) {
  const template = document.getElementById(templateId);
  if (!template) {
    throw new Error(`Template introuvable: #${templateId}`);
  }
  return template.content.cloneNode(true);
}

export function createColumnElement({ id, label, count, accent }) {
  const fragment = cloneTemplate(TEMPLATE_IDS.COLUMN);
  const column = fragment.querySelector('.column');
  const title = fragment.querySelector('.column__title');
  const countEl = fragment.querySelector('.column__count');
  const dropZone = fragment.querySelector('.column__cards');
  const accentBar = fragment.querySelector('.column__accent');
  const editBtn = fragment.querySelector('[data-action="edit-column"]');
  const deleteBtn = fragment.querySelector('[data-action="delete-column"]');

  column.dataset.columnId = id;
  dropZone.dataset.columnId = id;
  title.textContent = label;
  countEl.textContent = count;
  if (accentBar && accent) accentBar.style.background = accent;
  if (editBtn) editBtn.dataset.columnId = id;
  if (deleteBtn) deleteBtn.dataset.columnId = id;

  return fragment;
}

export function createEmptyColumnElement() {
  return cloneTemplate(TEMPLATE_IDS.EMPTY_COLUMN);
}

export function createTaskCardElement(task) {
  const data = normalizeTask(task);
  const fragment = cloneTemplate(TEMPLATE_IDS.TASK_CARD);
  const card = fragment.querySelector('.card');
  const titleEl = fragment.querySelector('.card__title');
  const descEl = fragment.querySelector('.card__description');
  const badge = fragment.querySelector('.card__badge');
  const dateEl = fragment.querySelector('.card__date');
  const dateText = fragment.querySelector('.card__date-text');
  const deleteBtn = fragment.querySelector('[data-action="delete"]');
  const editBtn = fragment.querySelector('[data-action="edit"]');
  const priority = getPriorityMeta(data.priority);
  const formattedDate = formatTaskDate(data.dueDate || data.createdAt);

  card.dataset.taskId = data.id;
  card.setAttribute('draggable', 'true');
  const colorClass = TASK_CARD_COLORS[data.color]?.class;
  if (colorClass) card.classList.add(colorClass);
  titleEl.textContent = data.title;

  if (data.description) {
    descEl.textContent = data.description;
    descEl.hidden = false;
  } else {
    descEl.hidden = true;
  }

  badge.textContent = priority.label;
  badge.classList.add('badge', priority.class);

  if (formattedDate) {
    dateText.textContent = formattedDate;
    dateEl.hidden = false;
  } else {
    dateEl.hidden = true;
  }

  deleteBtn.dataset.taskId = data.id;
  editBtn.dataset.taskId = data.id;

  return fragment;
}
