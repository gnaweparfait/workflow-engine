import { EVENTS, SELECTORS } from '../../core/constants.js';
import { $ } from '../../utils/dom.js';

/**
 * Module History — boutons Undo/Redo + raccourcis clavier.
 */
export function initHistoryModule({ bus, history }) {
  const btnUndo = $(SELECTORS.BTN_UNDO);
  const btnRedo = $(SELECTORS.BTN_REDO);

  function updateButtons({ canUndo, canRedo }) {
    if (btnUndo) {
      btnUndo.disabled = !canUndo;
      btnUndo.classList.toggle('btn--disabled', !canUndo);
    }
    if (btnRedo) {
      btnRedo.disabled = !canRedo;
      btnRedo.classList.toggle('btn--disabled', !canRedo);
    }
  }

  btnUndo?.addEventListener('click', () => history.undo());
  btnRedo?.addEventListener('click', () => history.redo());

  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;

    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      history.undo();
    }
    if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
      e.preventDefault();
      history.redo();
    }
  });

  bus.subscribe(EVENTS.HISTORY_CHANGED, updateButtons);
  history.publishHistoryChanged();
}
