import {
  DEFAULT_COLUMN_ACCENT,
  EVENTS,
  SELECTORS,
} from '../../core/constants.js';
import {
  createAddColumnCommand,
  createUpdateColumnCommand,
} from '../../core/commands.js';
import { getSortedColumns } from '../../utils/columns.js';
import { $ } from '../../utils/dom.js';
import { generateColumnId } from '../../utils/id.js';

export function initColumnsModule({ bus, state, history }) {
  const modal = $(SELECTORS.COLUMN_MODAL);
  const form = $(SELECTORS.COLUMN_MODAL_FORM);
  const modalTitle = $(SELECTORS.COLUMN_MODAL_TITLE);
  const btnNew = $(SELECTORS.BTN_NEW_COLUMN);
  const labelInput = $('#column-label');
  const accentInput = $('#column-accent');
  const submitBtn = $('#column-submit-btn');

  let editingColumnId = null;

  function openModal(mode = 'create', column = null) {
    editingColumnId = mode === 'edit' && column ? column.id : null;
    modal.hidden = false;
    modal.classList.add('modal--open');
    document.body.classList.add('modal-open');

    if (mode === 'edit' && column) {
      modalTitle.textContent = 'Modifier la colonne';
      submitBtn.textContent = 'Enregistrer';
      labelInput.value = column.label;
      accentInput.value = column.accent;
    } else {
      modalTitle.textContent = 'Nouvelle colonne';
      submitBtn.textContent = 'Créer la colonne';
      form.reset();
      accentInput.value = DEFAULT_COLUMN_ACCENT;
    }

    labelInput.focus();
  }

  function closeModal() {
    modal.classList.remove('modal--open');
    if (!document.querySelector('.modal.modal--open')) {
      document.body.classList.remove('modal-open');
    }
    setTimeout(() => {
      modal.hidden = true;
      editingColumnId = null;
      form.reset();
    }, 200);
  }

  btnNew?.addEventListener('click', () => openModal('create'));

  modal.querySelectorAll('[data-action="close-column-modal"]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target.matches('.modal__backdrop')) closeModal();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const label = labelInput.value.trim();
    if (!label) {
      labelInput.classList.add('input--invalid');
      labelInput.focus();
      return;
    }
    labelInput.classList.remove('input--invalid');

    const accent = accentInput.value || DEFAULT_COLUMN_ACCENT;

    try {
      if (editingColumnId) {
        const previous = state.getState().columns.find((c) => c.id === editingColumnId);
        if (!previous) {
          bus.publish(EVENTS.NOTIFY, {
            message: 'Colonne introuvable',
            type: 'error',
          });
          return;
        }
        history.execute(
          createUpdateColumnCommand(state, editingColumnId, { label, accent }, previous),
          { message: 'Column updated', type: 'success' }
        );
      } else {
        const columns = getSortedColumns(state.getState().columns);
        const order = columns.length ? Math.max(...columns.map((c) => c.order)) + 1 : 0;
        const column = {
          id: generateColumnId(),
          label,
          accent,
          order,
        };
        history.execute(createAddColumnCommand(state, column), {
          message: 'Column created',
          type: 'success',
        });
      }
    } catch (err) {
      console.error('[WorkflowEngine] create/edit column failed:', err);
      bus.publish(EVENTS.NOTIFY, {
        message: 'Erreur lors de la gestion de la colonne',
        type: 'error',
      });
      return;
    }

    closeModal();
  });

  bus.subscribe(EVENTS.COLUMN_EDIT_REQUEST, ({ column }) => openModal('edit', column));
  bus.subscribe(EVENTS.COLUMN_CREATE_REQUEST, () => openModal('create'));
}
