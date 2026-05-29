/**
 * Bus d'événements — Pub/Sub (projet DW 2.0).
 *
 * Basé sur addEventListener + CustomEvent (TP événements / fiche DOM).
 * Dans le navigateur : les modules écoutent document.
 * Dans Node (tests) : appel direct des handlers enregistrés.
 */
export function createEventBus() {
  var registre = {};
  var dansNavigateur = typeof document !== 'undefined';

  function subscribe(type, handler) {
    if (!registre[type]) {
      registre[type] = [];
    }

    var listener = null;
    if (dansNavigateur) {
      listener = function (event) {
        handler(event.detail);
      };
      document.addEventListener(type, listener);
    }

    registre[type].push({ handler: handler, listener: listener });

    return function desabonner() {
      unsubscribe(type, handler);
    };
  }

  function unsubscribe(type, handler) {
    var liste = registre[type];
    if (!liste) return;

    for (var i = 0; i < liste.length; i++) {
      if (liste[i].handler === handler) {
        if (liste[i].listener && dansNavigateur) {
          document.removeEventListener(type, liste[i].listener);
        }
        liste.splice(i, 1);
        break;
      }
    }
    if (liste.length === 0) {
      delete registre[type];
    }
  }

  function publish(type, detail) {
    var payload = detail || {};

    if (dansNavigateur) {
      document.dispatchEvent(
        new CustomEvent(type, {
          detail: payload,
          bubbles: false,
          cancelable: false,
        })
      );
      return;
    }

    var liste = registre[type] || [];
    for (var j = 0; j < liste.length; j++) {
      liste[j].handler(payload);
    }
  }

  return {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    publish: publish,
  };
}
