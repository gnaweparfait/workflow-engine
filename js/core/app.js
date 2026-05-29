import { createEventBus } from './eventBus.js';
import { createStateManager } from './stateManager.js';
import { createCommandHistory } from './commandHistory.js';
import { createStorageService, hydrateState } from '../services/storageService.js';
import { initBoardModule } from '../modules/board/boardModule.js';
import { initTasksModule } from '../modules/tasks/tasksModule.js';
import { initSearchModule } from '../modules/search/searchModule.js';
import { initNotificationsModule } from '../modules/notifications/notificationsModule.js';
import { initPersistenceModule } from '../modules/persistence/persistenceModule.js';
import { initThemeModule } from '../modules/theme/themeModule.js';
import { initColumnsModule } from '../modules/columns/columnsModule.js';
import { initHistoryModule } from '../modules/history/historyModule.js';
import { initExportImportModule } from '../modules/exportImport/exportImportModule.js';

export function initApp() {
  const bus = createEventBus();
  const storage = createStorageService();
  const persisted = storage.loadState();
  const hydrated = hydrateState(persisted);
  const state = createStateManager(hydrated, { bus, storage });

  /* Sauvegarde si des colonnes par défaut ont été réinjectées */
  if (persisted && hydrated.columns.length > (persisted.columns || []).length) {
    storage.saveState(state.getState());
  }

  const history = createCommandHistory(state, bus);

  initTasksModule({ bus, state, history });
  initColumnsModule({ bus, state, history });
  initSearchModule({ bus, state });
  initNotificationsModule({ bus });
  initBoardModule({ bus, state, history });
  initPersistenceModule({ bus, state, storage });
  initHistoryModule({ bus, history });
  initExportImportModule({ bus, state });
  initThemeModule();

  return { bus, state, storage, history };
}
