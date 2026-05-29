import { DEFAULT_STATE, STORAGE_KEY } from '../core/constants.js';
import { normalizeColumns, reassignOrphanTasks } from '../utils/columns.js';
import { normalizeTask } from '../utils/format.js';
import { copierObjet } from '../utils/copy.js';

export function createStorageService(key = STORAGE_KEY) {
  return {
    saveState(state) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error('[StorageService] saveState failed:', error);
      }
    },

    loadState() {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (error) {
        console.error('[StorageService] loadState failed:', error);
        return null;
      }
    },

    clearState() {
      localStorage.removeItem(key);
    },
  };
}

export function hydrateState(loaded) {
  if (!loaded) return copierObjet(DEFAULT_STATE);

  var columns = normalizeColumns(loaded.columns);
  var taskList = loaded.tasks ? loaded.tasks : [];
  var tasks = reassignOrphanTasks(
    taskList.map(function (t) {
      return normalizeTask(t);
    }),
    columns
  );

  return Object.assign({}, DEFAULT_STATE, {
    searchQuery: typeof loaded.searchQuery === 'string' ? loaded.searchQuery : '',
    columns: columns,
    tasks: tasks,
  });
}
