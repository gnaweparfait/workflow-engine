import { EVENTS, TEMPLATE_IDS } from '../../core/constants.js';
import { $ } from '../../utils/dom.js';
import { cloneTemplate } from '../../utils/templates.js';

const TOAST_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
};

export function initNotificationsModule({ bus }) {
  const container = $('#notifications');

  function showToast(message, type = 'info') {
    const fragment = cloneTemplate(TEMPLATE_IDS.TOAST);
    const toast = fragment.querySelector('.toast');
    const iconEl = fragment.querySelector('.toast__icon');
    const msgEl = fragment.querySelector('.toast__message');

    toast.classList.add(`toast--${type}`);
    iconEl.innerHTML = TOAST_ICONS[type] ?? TOAST_ICONS.info;
    msgEl.textContent = message;

    container.appendChild(fragment);

    const el = container.lastElementChild;
    requestAnimationFrame(() => el.classList.add('toast--visible'));

    setTimeout(() => {
      el.classList.remove('toast--visible');
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }

  bus.subscribe(EVENTS.NOTIFY, ({ message, type }) => {
    showToast(message, type);
  });
}
