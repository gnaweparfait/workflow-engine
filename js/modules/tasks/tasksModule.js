import { DEFAULT_PRIORITY, EVENTS, SELECTORS } from '../../core/constants.js';
import {
  createAddTaskCommand,
  createUpdateTaskCommand,
} from '../../core/commands.js';
import { $, filterColumnsByQuery } from '../../utils/dom.js';
import { normalizeTask } from '../../utils/format.js';
import { generateTaskId } from '../../utils/id.js';

export function initTasksModule({ bus, state, history }) {
  const modal = $(SELECTORS.MODAL);
  const form = $(SELECTORS.MODAL_FORM);
  const modalTitle = $(SELECTORS.MODAL_TITLE);
  const btnNew = $(SELECTORS.BTN_NEW_TASK);
  const titleInput = $('#task-title');
  const descInput = $('#task-description');
  const priorityInput = $('#task-priority');
  const dueInput = $('#task-due-date');
  const colorInput = $('#task-color');
  const columnSearchInput = $('#task-column-search');
  const columnPicker = $('#task-column-picker');
  const columnPickerEmpty = columnPicker?.querySelector('.column-picker__empty');
  const submitBtn = $('#task-submit-btn');

  let editingTaskId = null;
  let presetColumnId = 'todo';

  function getSelectedColumnId() {
    const checked = columnPicker.querySelector('input[name="task-column"]:checked');
    return checked?.value ?? presetColumnId;
  }

  function updateColumnPickerSelection() {
    var options = columnPicker.querySelectorAll('.column-picker__option');
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      var input = option.querySelector('input[name="task-column"]');
      if (input && input.checked) {
        option.classList.add('column-picker__option--selected');
      } else {
        option.classList.remove('column-picker__option--selected');
      }
    }
  }

  function setSelectedColumnId(columnId) {
    var radio = columnPicker.querySelector(
      'input[name="task-column"][value="' + columnId + '"]'
    );
    if (radio) {
      radio.checked = true;
      presetColumnId = columnId;
      updateColumnPickerSelection();
    }
  }

  function renderColumnPickerOptions() {
    const filterQuery = columnSearchInput?.value ?? '';
    const visible = filterColumnsByQuery(filterQuery, state.getState().columns);
    const emptyMsg = columnPicker.querySelector('.column-picker__empty');

    columnPicker.querySelectorAll('.column-picker__option').forEach((el) => el.remove());

    visible.forEach((col) => {
      const label = document.createElement('label');
      label.className = 'column-picker__option';
      label.dataset.columnId = col.id;
      label.innerHTML = `
        <input type="radio" name="task-column" value="${col.id}" />
        <span class="column-picker__accent" style="--accent: ${col.accent}"></span>
        <span class="column-picker__label"></span>
      `;
      label.querySelector('.column-picker__label').textContent = col.label;
      columnPicker.insertBefore(label, emptyMsg);
    });

    if (emptyMsg) emptyMsg.hidden = visible.length > 0;

    const selectedVisible = visible.some((c) => c.id === getSelectedColumnId());
    if (!selectedVisible && visible.length > 0) {
      setSelectedColumnId(visible[0].id);
    } else if (visible.length > 0) {
      setSelectedColumnId(getSelectedColumnId());
    }
    updateColumnPickerSelection();
  }

  function openModal(mode = 'create', task = null, columnId = null) {
    editingTaskId = mode === 'edit' && task ? task.id : null;
    modal.hidden = false;
    modal.classList.add('modal--open');
    document.body.classList.add('modal-open');

    columnSearchInput.value = '';
    const defaultCol = columnId ?? state.getState().columns[0]?.id ?? 'todo';

    if (mode === 'edit' && task) {
      const data = normalizeTask(task);
      modalTitle.textContent = 'Modifier la tâche';
      submitBtn.textContent = 'Enregistrer';
      titleInput.value = data.title;
      descInput.value = data.description;
      priorityInput.value = data.priority;
      dueInput.value = data.dueDate ? data.dueDate.slice(0, 10) : '';
      if (colorInput) colorInput.value = data.color ?? 'default';
      presetColumnId = data.columnId;
    } else {
      modalTitle.textContent = 'Nouvelle tâche';
      submitBtn.textContent = 'Créer la tâche';
      form.reset();
      priorityInput.value = DEFAULT_PRIORITY;
      if (colorInput) colorInput.value = 'default';
      presetColumnId = defaultCol;
    }

    renderColumnPickerOptions();
    setSelectedColumnId(presetColumnId);
    titleInput.focus();
  }

  function closeModal() {
    modal.classList.remove('modal--open');
    if (!document.querySelector('.modal.modal--open')) {
      document.body.classList.remove('modal-open');
    }
    setTimeout(() => {
      modal.hidden = true;
      editingTaskId = null;
      form.reset();
      columnSearchInput.value = '';
    }, 200);
  }

  btnNew?.addEventListener('click', () => {
    const firstCol = state.getState().columns[0]?.id;
    openModal('create', null, firstCol);
  });

  columnSearchInput.addEventListener('input', renderColumnPickerOptions);

  columnPicker.addEventListener('change', function (e) {
    if (e.target.matches('input[name="task-column"]')) {
      presetColumnId = e.target.value;
      updateColumnPickerSelection();
    }
  });

  modal.querySelectorAll('[data-action="close-modal"]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target.matches('.modal__backdrop')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('modal--open')) {
      closeModal();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    if (!title) {
      titleInput.classList.add('input--invalid');
      titleInput.focus();
      return;
    }
    titleInput.classList.remove('input--invalid');

    const appColumns = state.getState().columns;
    let columnId = getSelectedColumnId();
    if (!appColumns.some((c) => c.id === columnId)) {
      columnId = appColumns[0]?.id;
    }
    if (!columnId) {
      bus.publish(EVENTS.NOTIFY, {
        message: 'Aucune colonne disponible',
        type: 'error',
      });
      return;
    }
    columnSearchInput.classList.remove('input--invalid');

    const payload = {
      title,
      description: descInput.value.trim(),
      priority: priorityInput.value,
      dueDate: dueInput.value ? new Date(dueInput.value).toISOString() : null,
      color: colorInput?.value ?? 'default',
      columnId,
    };

    try {
      if (editingTaskId) {
        const previous = state.getState().tasks.find((t) => t.id === editingTaskId);
        if (!previous) {
          bus.publish(EVENTS.NOTIFY, {
            message: 'Tâche introuvable (édition)',
            type: 'error',
          });
          return;
        }

        if (history && typeof history.execute === 'function') {
          history.execute(
            createUpdateTaskCommand(state, editingTaskId, payload, previous),
            { message: 'Task updated', type: 'success' }
          );
        } else {
          // Fallback sans historique
          state.updateTask(editingTaskId, payload);
        }
      } else {
        const task = {
          id: generateTaskId(),
          ...payload,
          createdAt: Date.now(),
        };

        if (history && typeof history.execute === 'function') {
          history.execute(createAddTaskCommand(state, task), {
            message: 'Task created',
            type: 'success',
          });
        } else {
          // Fallback sans historique
          state.addTask(task);
        }
      }
    } catch (err) {
      console.error('[WorkflowEngine] create/edit task failed:', err);
      bus.publish(EVENTS.NOTIFY, {
        message: 'Erreur interne lors de la création. Voir la console.',
        type: 'error',
      });
      return;
    }

    closeModal();
  });

  titleInput.addEventListener('input', () => {
    titleInput.classList.remove('input--invalid');
  });

  columnSearchInput.addEventListener('input', () => {
    columnSearchInput.classList.remove('input--invalid');
  });

  bus.subscribe(EVENTS.TASK_EDIT_REQUEST, ({ task }) => openModal('edit', task));
  bus.subscribe(EVENTS.TASK_CREATE_REQUEST, ({ columnId }) =>
    openModal('create', null, columnId)
  );
  bus.subscribe(EVENTS.STATE_CHANGED, () => {
    if (modal.classList.contains('modal--open')) {
      renderColumnPickerOptions();
    }
  });
}
