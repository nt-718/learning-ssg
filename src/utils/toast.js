let activeToast;
let dismissTimer;

export function showToast(message, { actionLabel, onAction, duration = 4200 } = {}) {
  activeToast?.remove();
  clearTimeout(dismissTimer);

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <span>${message}</span>
    ${actionLabel ? `<button type="button">${actionLabel}</button>` : ''}
  `;
  document.body.appendChild(toast);
  activeToast = toast;

  const dismiss = () => {
    if (activeToast === toast) activeToast = null;
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 180);
  };

  toast.querySelector('button')?.addEventListener('click', () => {
    onAction?.();
    dismiss();
  });
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  dismissTimer = setTimeout(dismiss, duration);
}
