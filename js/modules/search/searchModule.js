import { EVENTS } from '../../core/constants.js';
import { $ } from '../../utils/dom.js';

/**
 * Module Search — filtrage temps réel via le state (pas de reload).
 */
export function initSearchModule({ bus, state }) {
  const input = $('#search-input');
  input.value = state.getState().searchQuery;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    state.setSearchQuery(query);
    // STATE_CHANGED + SEARCH_CHANGED émis par stateManager
  });

  bus.subscribe(EVENTS.STATE_CHANGED, ({ state: appState }) => {
    if (input.value !== appState.searchQuery) {
      input.value = appState.searchQuery;
    }
  });
}
