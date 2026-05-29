/**
 * Pattern Commande — chaque commande expose execute() et undo().
 */

export function createAddTaskCommand(state, task) {
  return {
    label: 'ADD_TASK',
    execute() {
      state.addTask(task, { silent: true });
    },
    undo() {
      state.deleteTask(task.id, { silent: true });
    },
  };
}

export function createUpdateTaskCommand(state, id, patch, previousTask) {
  return {
    label: 'UPDATE_TASK',
    execute() {
      state.updateTask(id, patch, { silent: true });
    },
    undo() {
      state.updateTask(
        id,
        {
          title: previousTask.title,
          description: previousTask.description,
          priority: previousTask.priority,
          dueDate: previousTask.dueDate,
          columnId: previousTask.columnId,
          color: previousTask.color,
        },
        { silent: true }
      );
    },
  };
}

export function createDeleteTaskCommand(state, task) {
  return {
    label: 'DELETE_TASK',
    execute() {
      state.deleteTask(task.id, { silent: true });
    },
    undo() {
      state.addTask(task, { silent: true });
    },
  };
}

export function createMoveTaskCommand(state, taskId, toColumn, fromColumn) {
  return {
    label: 'MOVE_TASK',
    execute() {
      state.moveTask(taskId, toColumn, { silent: true });
    },
    undo() {
      state.moveTask(taskId, fromColumn, { silent: true });
    },
  };
}

export function createAddColumnCommand(state, column) {
  return {
    label: 'ADD_COLUMN',
    execute() {
      state.addColumn(column, { silent: true });
    },
    undo() {
      state.deleteColumn(column.id, { silent: true });
    },
  };
}

export function createUpdateColumnCommand(state, id, patch, previousColumn) {
  return {
    label: 'UPDATE_COLUMN',
    execute() {
      state.updateColumn(id, patch, { silent: true });
    },
    undo() {
      state.updateColumn(
        id,
        {
          label: previousColumn.label,
          accent: previousColumn.accent,
          order: previousColumn.order,
        },
        { silent: true }
      );
    },
  };
}

export function createDeleteColumnCommand(state, column) {
  let affectedTasks = [];

  return {
    label: 'DELETE_COLUMN',
    execute() {
      affectedTasks = state
        .getState()
        .tasks.filter((t) => t.columnId === column.id)
        .map((t) => ({ ...t }));
      state.deleteColumn(column.id, { silent: true });
    },
    undo() {
      const current = state.getState();
      state.replaceState(
        {
          ...current,
          columns: [...current.columns, { ...column }],
          tasks: current.tasks.map((t) => {
            const orig = affectedTasks.find((a) => a.id === t.id);
            return orig ? { ...t, columnId: orig.columnId } : t;
          }),
        },
        { emit: false }
      );
    },
  };
}
