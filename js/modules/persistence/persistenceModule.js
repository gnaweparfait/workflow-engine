import { EVENTS, SELECTORS } from '../../core/constants.js';
import { $ } from '../../utils/dom.js';

/**
 * Module Persistence — sauvegarde manuelle uniquement s'il y a des modifications.
 */
export function initPersistenceModule({ bus, state, storage }) {
  const btnSave = $(SELECTORS.BTN_SAVE_ALL);

  if (!btnSave) return;

  let savedSnapshot = serializeState(state.getState());

  function serializeState(appState) {
    return JSON.stringify(appState);
  }

  function hasUnsavedChanges() {
    return serializeState(state.getState()) !== savedSnapshot;
  }

  function updateSaveButton() {
    const dirty = hasUnsavedChanges();
    btnSave.disabled = !dirty;
    btnSave.setAttribute('aria-disabled', String(!dirty));
    btnSave.classList.toggle('btn--disabled', !dirty);
    btnSave.title = dirty
      ? 'Enregistrer les modifications (glisser-déposer, ajouts, etc.)'
      : 'Aucune modification à enregistrer';
  }

  function saveAllTasks() {
    if (!hasUnsavedChanges()) {
      bus.publish(EVENTS.NOTIFY, {
        message: 'Aucune modification à enregistrer',
        type: 'info',
      });
      return;
    }

    const appState = state.getState();
    storage.saveState(appState);
    savedSnapshot = serializeState(appState);

    const count = appState.tasks.length;
    bus.publish(EVENTS.NOTIFY, {
      message:
        count === 0
          ? 'Modifications enregistrées'
          : `${count} tâche${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''}`,
      type: 'success',
    });

    btnSave.classList.add('btn--saved');
    updateSaveButton();
    setTimeout(() => btnSave.classList.remove('btn--saved'), 1200);
  }

  btnSave.addEventListener('click', saveAllTasks);

  bus.subscribe(EVENTS.STATE_CHANGED, ({ state: appState }) => {
    // Aligné sur la sauvegarde auto du StateManager (emitStateChanged)
    savedSnapshot = serializeState(appState);
    updateSaveButton();
  });
  bus.subscribe(EVENTS.HISTORY_CHANGED, updateSaveButton);
  updateSaveButton();
}
