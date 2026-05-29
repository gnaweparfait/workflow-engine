import { EVENTS, SELECTORS } from '../../core/constants.js';
import { $ } from '../../utils/dom.js';
import { parseImportedState } from '../../utils/importState.js';

export function initExportImportModule({ bus, state }) {
  const btnExport = $(SELECTORS.BTN_EXPORT);
  const btnImport = $(SELECTORS.BTN_IMPORT);
  const fileInput = $(SELECTORS.IMPORT_FILE);

  btnExport?.addEventListener('click', () => {
    try {
      const payload = state.getState();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workflow-engine-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      bus.publish(EVENTS.NOTIFY, {
        message: 'Export JSON téléchargé',
        type: 'success',
      });
    } catch (err) {
      console.error('[WorkflowEngine] export failed:', err);
      bus.publish(EVENTS.NOTIFY, {
        message: "Impossible d'exporter les données",
        type: 'error',
      });
    }
  });

  btnImport?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;

    try {
      const raw = JSON.parse(await file.text());
      const next = parseImportedState(raw);

      if (
        !confirm(
          'Importer ce fichier remplacera toutes les tâches et colonnes actuelles. Continuer ?'
        )
      ) {
        return;
      }

      state.replaceState(next);
      bus.publish(EVENTS.NOTIFY, {
        message: 'Import JSON réussi',
        type: 'success',
      });
    } catch (err) {
      console.error('[WorkflowEngine] import failed:', err);
      bus.publish(EVENTS.NOTIFY, {
        message: 'Fichier JSON invalide ou incompatible',
        type: 'error',
      });
    }
  });
}
