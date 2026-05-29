/**
 * Smoke test logique (Node) — state, commandes, historique.
 * Usage: node scripts/smoke-test.mjs
 */
import { createEventBus } from '../js/core/eventBus.js';
import { createStateManager } from '../js/core/stateManager.js';
import { createCommandHistory } from '../js/core/commandHistory.js';
import {
  createAddTaskCommand,
  createMoveTaskCommand,
  createDeleteTaskCommand,
  createAddColumnCommand,
} from '../js/core/commands.js';
import { DEFAULT_STATE } from '../js/core/constants.js';
import { parseImportedState } from '../js/utils/importState.js';

const storage = {
  saveState() {},
};
const bus = createEventBus();
const state = createStateManager(structuredClone(DEFAULT_STATE), { bus, storage });
const history = createCommandHistory(state, bus);

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log('  OK', msg);
  } else {
    failed++;
    console.error('  FAIL', msg);
  }
}

// Création tâche
const task = {
  id: 't1',
  title: 'Test',
  description: '',
  priority: 'medium',
  columnId: 'todo',
  createdAt: Date.now(),
};
history.execute(createAddTaskCommand(state, task));
assert(state.getState().tasks.length === 1, 'création tâche');

// Déplacement
history.execute(createMoveTaskCommand(state, 't1', 'in-progress', 'todo'));
assert(state.getState().tasks[0].columnId === 'in-progress', 'déplacement tâche');

// Undo move
history.undo();
assert(state.getState().tasks[0].columnId === 'todo', 'undo déplacement');

// Colonne
history.execute(
  createAddColumnCommand(state, {
    id: 'col-x',
    label: 'Revue',
    accent: '#6366f1',
    order: 99,
  })
);
assert(state.getState().columns.some((c) => c.id === 'col-x'), 'création colonne');

// Suppression tâche
const t = state.getState().tasks[0];
history.execute(createDeleteTaskCommand(state, t));
assert(state.getState().tasks.length === 0, 'suppression tâche');

history.undo();
assert(state.getState().tasks.length === 1, 'undo suppression');

// Import format legacy groupe (tasks dans colonnes)
const legacy = parseImportedState({
  columns: [
    {
      id: 'c1',
      title: 'À faire',
      tasks: [{ id: 'lt1', text: 'Legacy', priority: 'high', color: 'red' }],
    },
  ],
});
assert(legacy.tasks.length === 1 && legacy.tasks[0].title === 'Legacy', 'import legacy groupe');
assert(legacy.columns.some((c) => c.id === 'c1'), 'colonnes legacy');

console.log(`\nRésultat: ${passed} OK, ${failed} échec(s)`);
process.exit(failed > 0 ? 1 : 0);
