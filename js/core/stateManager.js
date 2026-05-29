import { DEFAULT_STATE, EVENTS } from './constants.js';
import { getSortedColumns } from '../utils/columns.js';
import { copierObjet } from '../utils/copy.js';

/**
 * Gestionnaire d'état global — tâches, colonnes (objets + tableaux, TP 1).
 * Chaque modification notifie le bus pour redessiner le DOM.
 */
export function createStateManager(initialState, options) {
  var bus = options && options.bus;
  var storage = options && options.storage;
  var state = copierObjet(initialState || DEFAULT_STATE);

  function snapshot() {
    return copierObjet(state);
  }

  function emitStateChanged() {
    var next = snapshot();
    if (bus) {
      bus.publish(EVENTS.STATE_CHANGED, { state: next });
    }
    if (storage) {
      storage.saveState(next);
    }
  }

  function findTaskIndex(id) {
    return state.tasks.findIndex((t) => t.id === id);
  }

  function findColumnIndex(id) {
    return state.columns.findIndex((c) => c.id === id);
  }

  return {
    getState() {
      return snapshot();
    },

    replaceState(nextState, options) {
      var emit = !options || options.emit !== false;
      state = copierObjet(nextState);
      if (emit) emitStateChanged();
      return snapshot();
    },

    setState(partial, options) {
      state = Object.assign({}, state, partial);
      if (!options || !options.silent) emitStateChanged();
      return snapshot();
    },

    setSearchQuery(query) {
      state.searchQuery = query;
      bus?.publish(EVENTS.SEARCH_CHANGED, { query });
      emitStateChanged();
      return snapshot();
    },

    addTask(task, { silent = false } = {}) {
      state = {
        ...state,
        tasks: [...state.tasks, { ...task }],
      };
      if (!silent) {
        bus?.publish(EVENTS.TASK_CREATED, { task });
        bus?.publish(EVENTS.NOTIFY, {
          message: 'Task created',
          type: 'success',
        });
        emitStateChanged();
      }
      return task;
    },

    updateTask(id, patch, { silent = false } = {}) {
      const index = findTaskIndex(id);
      if (index === -1) return null;

      const updated = { ...state.tasks[index], ...patch };
      const tasks = [...state.tasks];
      tasks[index] = updated;
      state = { ...state, tasks };

      if (!silent) {
        bus?.publish(EVENTS.TASK_UPDATED, { id, task: updated, patch });
        emitStateChanged();
      }
      return updated;
    },

    deleteTask(id, { silent = false } = {}) {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return false;

      state = {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== id),
      };

      if (!silent) {
        bus?.publish(EVENTS.TASK_DELETED, { id, task });
        bus?.publish(EVENTS.NOTIFY, {
          message: 'Task deleted',
          type: 'info',
        });
        emitStateChanged();
      }
      return true;
    },

    moveTask(id, columnId, { silent = false } = {}) {
      const index = findTaskIndex(id);
      if (index === -1) return null;

      const task = state.tasks[index];
      if (task.columnId === columnId) return task;

      const fromColumn = task.columnId;
      const updated = { ...task, columnId };
      const tasks = [...state.tasks];
      tasks[index] = updated;
      state = { ...state, tasks };

      if (!silent) {
        bus?.publish(EVENTS.TASK_MOVED, {
          taskId: id,
          fromColumn,
          toColumn: columnId,
          task: updated,
        });
        bus?.publish(EVENTS.NOTIFY, {
          message: 'Task moved',
          type: 'success',
        });
        emitStateChanged();
      }
      return updated;
    },

    addColumn(column, { silent = false } = {}) {
      const order =
        column.order ??
        Math.max(-1, ...state.columns.map((c) => c.order ?? 0)) + 1;
      const newColumn = { ...column, order };
      state = {
        ...state,
        columns: [...state.columns, newColumn],
      };
      if (!silent) {
        bus?.publish(EVENTS.COLUMN_CREATED, { column: newColumn });
        bus?.publish(EVENTS.NOTIFY, {
          message: 'Column created',
          type: 'success',
        });
        emitStateChanged();
      }
      return newColumn;
    },

    updateColumn(id, patch, { silent = false } = {}) {
      const index = findColumnIndex(id);
      if (index === -1) return null;

      const updated = { ...state.columns[index], ...patch };
      const columns = [...state.columns];
      columns[index] = updated;
      state = { ...state, columns };

      if (!silent) {
        bus?.publish(EVENTS.COLUMN_UPDATED, { id, column: updated, patch });
        bus?.publish(EVENTS.NOTIFY, {
          message: 'Column updated',
          type: 'success',
        });
        emitStateChanged();
      }
      return updated;
    },

    deleteColumn(id, { silent = false } = {}) {
      const column = state.columns.find((c) => c.id === id);
      if (!column) return false;

      const remaining = state.columns.filter((c) => c.id !== id);
      if (remaining.length === 0) return false;

      const fallback = getSortedColumns(remaining)[0].id;
      state = {
        columns: remaining,
        tasks: state.tasks.map((t) =>
          t.columnId === id ? { ...t, columnId: fallback } : t
        ),
        searchQuery: state.searchQuery,
      };

      if (!silent) {
        bus?.publish(EVENTS.COLUMN_DELETED, { id, column });
        bus?.publish(EVENTS.NOTIFY, {
          message: 'Column deleted',
          type: 'info',
        });
        emitStateChanged();
      }
      return true;
    },

    /** Force l'émission stateChanged (utilisé par l'historique) */
    commit() {
      emitStateChanged();
    },
  };
}
