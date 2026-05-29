import { DEFAULT_PRIORITY, EVENTS, SELECTORS } from '../../core/constants.js';
import {
  createAddTaskCommand,
  createDeleteColumnCommand,
  createDeleteTaskCommand,
  createMoveTaskCommand,
} from '../../core/commands.js';
import { generateTaskId } from '../../utils/id.js';
import { getSortedColumns } from '../../utils/columns.js';
import { $, filterTasksByQuery } from '../../utils/dom.js';
import {
  createColumnElement,
  createEmptyColumnElement,
  createTaskCardElement,
} from '../../utils/templates.js';

export function initBoardModule({ bus, state, history }) {
  const boardEl = $(SELECTORS.BOARD);
  const taskCountEl = $(SELECTORS.TASK_COUNT);
  let draggedTaskId = null;

  function updateTaskCounter(total) {
    if (!taskCountEl) return;
    taskCountEl.textContent = total;
    taskCountEl.setAttribute(
      'aria-label',
      `${total} tâche${total !== 1 ? 's' : ''} au total`
    );
  }

  function quickAddTask(columnId, title) {
    const trimmed = title.trim();
    if (!trimmed) {
      bus.publish(EVENTS.NOTIFY, {
        message: 'Saisissez un titre pour la tâche',
        type: 'info',
      });
      return;
    }

    const task = {
      id: generateTaskId(),
      title: trimmed,
      description: '',
      priority: DEFAULT_PRIORITY,
      color: 'default',
      dueDate: null,
      columnId,
      createdAt: Date.now(),
    };

    try {
      history.execute(createAddTaskCommand(state, task), {
        message: 'Task created',
        type: 'success',
      });
    } catch (err) {
      console.error('[WorkflowEngine] quick add failed:', err);
      state.addTask(task);
    }
  }

  function render() {
    const appState = state.getState();
    const { tasks, searchQuery, columns } = appState;
    const sortedColumns = getSortedColumns(columns);
    const visibleTasks = filterTasksByQuery(tasks, searchQuery, columns);

    updateTaskCounter(tasks.length);
    boardEl.replaceChildren();

    sortedColumns.forEach((column) => {
      const colTasks = visibleTasks.filter((t) => t.columnId === column.id);
      const columnFragment = createColumnElement({
        id: column.id,
        label: column.label,
        count: colTasks.length,
        accent: column.accent,
      });
      const dropZone = columnFragment.querySelector(SELECTORS.COLUMN_DROP);

      if (colTasks.length === 0) {
        dropZone.appendChild(createEmptyColumnElement());
      } else {
        colTasks.forEach((task) => {
          dropZone.appendChild(createTaskCardElement(task));
        });
      }

      boardEl.appendChild(columnFragment);
    });

    var cards = boardEl.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.animationDelay = i * 40 + 'ms';
    }
  }

  boardEl.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest(SELECTORS.DELETE_BTN);
    if (deleteBtn?.matches(SELECTORS.DELETE_BTN) && boardEl.contains(deleteBtn)) {
      const task = state.getState().tasks.find((t) => t.id === deleteBtn.dataset.taskId);
      if (task) {
        try {
          history.execute(createDeleteTaskCommand(state, task), {
            message: 'Task deleted',
            type: 'info',
          });
        } catch (err) {
          console.error('[WorkflowEngine] delete task failed:', err);
          state.deleteTask(task.id);
        }
      }
      return;
    }

    const editBtn = event.target.closest(SELECTORS.EDIT_BTN);
    if (editBtn?.matches(SELECTORS.EDIT_BTN) && boardEl.contains(editBtn)) {
      const task = state.getState().tasks.find((t) => t.id === editBtn.dataset.taskId);
      if (task) bus.publish(EVENTS.TASK_EDIT_REQUEST, { task });
      return;
    }

    const editColBtn = event.target.closest(SELECTORS.EDIT_COLUMN_BTN);
    if (editColBtn?.matches(SELECTORS.EDIT_COLUMN_BTN) && boardEl.contains(editColBtn)) {
      const column = state.getState().columns.find((c) => c.id === editColBtn.dataset.columnId);
      if (column) bus.publish(EVENTS.COLUMN_EDIT_REQUEST, { column });
      return;
    }

    const deleteColBtn = event.target.closest(SELECTORS.DELETE_COLUMN_BTN);
    if (deleteColBtn?.matches(SELECTORS.DELETE_COLUMN_BTN) && boardEl.contains(deleteColBtn)) {
      const columnId = deleteColBtn.dataset.columnId;
      const appState = state.getState();
      if (appState.columns.length <= 1) {
        bus.publish(EVENTS.NOTIFY, {
          message: 'Impossible de supprimer la dernière colonne',
          type: 'info',
        });
        return;
      }
      const column = appState.columns.find((c) => c.id === columnId);
      if (column && confirm(`Supprimer la colonne « ${column.label} » ?`)) {
        try {
          history.execute(createDeleteColumnCommand(state, column), {
            message: 'Column deleted',
            type: 'info',
          });
        } catch (err) {
          console.error('[WorkflowEngine] delete column failed:', err);
          state.deleteColumn(column.id);
        }
      }
      return;
    }

    const addBtn = event.target.closest('[data-action="add-to-column"]');
    if (addBtn && boardEl.contains(addBtn)) {
      const column = addBtn.closest('.column');
      const columnId = column?.dataset.columnId;
      if (columnId) bus.publish(EVENTS.TASK_CREATE_REQUEST, { columnId });
      return;
    }

    const quickBtn = event.target.closest('[data-action="quick-add-task"]');
    if (quickBtn && boardEl.contains(quickBtn)) {
      const column = quickBtn.closest('.column');
      const input = column?.querySelector('.column__quick-input');
      const columnId = column?.dataset.columnId;
      if (columnId && input) {
        quickAddTask(columnId, input.value);
        input.value = '';
        input.focus();
      }
    }
  });

  boardEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.target.tagName !== 'INPUT') return;
    if (!event.target.matches('.column__quick-input')) return;

    event.preventDefault();
    const column = event.target.closest('.column');
    const columnId = column?.dataset.columnId;
    if (!columnId) return;

    quickAddTask(columnId, event.target.value);
    event.target.value = '';
  });

  boardEl.addEventListener('dragstart', (event) => {
    if (event.target.closest('[data-action]')) {
      event.preventDefault();
      return;
    }

    const card = event.target.closest(SELECTORS.CARD);
    if (!card?.matches(SELECTORS.CARD) || !boardEl.contains(card)) return;

    draggedTaskId = card.dataset.taskId;
    card.classList.add('card--dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedTaskId);
  });

  boardEl.addEventListener('dragend', (event) => {
    const card = event.target.closest(SELECTORS.CARD);
    if (card) card.classList.remove('card--dragging');
    draggedTaskId = null;
    boardEl
      .querySelectorAll('.column__cards--over')
      .forEach((el) => el.classList.remove('column__cards--over'));
  });

  boardEl.addEventListener('dragover', (event) => {
    const dropZone = event.target.closest(SELECTORS.COLUMN_DROP);
    if (!dropZone?.matches(SELECTORS.COLUMN_DROP) || !boardEl.contains(dropZone)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    dropZone.classList.add('column__cards--over');
  });

  boardEl.addEventListener('dragleave', (event) => {
    const dropZone = event.target.closest(SELECTORS.COLUMN_DROP);
    if (dropZone && !dropZone.contains(event.relatedTarget)) {
      dropZone.classList.remove('column__cards--over');
    }
  });

  boardEl.addEventListener('drop', (event) => {
    const dropZone = event.target.closest(SELECTORS.COLUMN_DROP);
    if (!dropZone?.matches(SELECTORS.COLUMN_DROP) || !boardEl.contains(dropZone)) return;

    event.preventDefault();
    dropZone.classList.remove('column__cards--over');

    const taskId = event.dataTransfer.getData('text/plain') || draggedTaskId;
    const columnId = dropZone.dataset.columnId;
    if (!taskId || !columnId) return;

    const task = state.getState().tasks.find((t) => t.id === taskId);
    if (!task || task.columnId === columnId) return;

    try {
      history.execute(
        createMoveTaskCommand(state, taskId, columnId, task.columnId),
        { message: 'Task moved', type: 'success' }
      );
    } catch (err) {
      console.error('[WorkflowEngine] move task failed:', err);
      state.moveTask(taskId, columnId);
    }
  });

  bus.subscribe(EVENTS.STATE_CHANGED, render);
  render();
}
