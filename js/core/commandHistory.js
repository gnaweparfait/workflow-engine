import { EVENTS, HISTORY_LIMIT } from './constants.js';

/**
 * Historique Undo/Redo — pattern Commande + événements.
 */
export function createCommandHistory(state, bus) {
  const undoStack = [];
  const redoStack = [];

  function publishHistoryChanged() {
    bus.publish(EVENTS.HISTORY_CHANGED, {
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
    });
  }

  function finalize(notifyMessage = null) {
    state.commit();
    if (notifyMessage) {
      bus.publish(EVENTS.NOTIFY, notifyMessage);
    }
    publishHistoryChanged();
  }

  return {
    canUndo() {
      return undoStack.length > 0;
    },

    canRedo() {
      return redoStack.length > 0;
    },

    execute(command, notifyMessage = null) {
      command.execute();
      undoStack.push(command);
      if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
      redoStack.length = 0;
      finalize(notifyMessage);
    },

    undo() {
      const command = undoStack.pop();
      if (!command) return false;

      command.undo();
      redoStack.push(command);
      finalize({ message: 'Action annulée', type: 'info' });
      return true;
    },

    redo() {
      const command = redoStack.pop();
      if (!command) return false;

      command.execute();
      undoStack.push(command);
      finalize({ message: 'Action rétablie', type: 'info' });
      return true;
    },

    publishHistoryChanged,
  };
}
