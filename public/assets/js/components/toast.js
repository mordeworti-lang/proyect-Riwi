/* =============================================================
   components/toast.js — lightweight notifications
   ============================================================= */

const Toast = (() => {
    function ensureContainer() {
        let el = document.getElementById('toast-container');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toast-container';
            document.body.appendChild(el);
        }
        return el;
    }

    function show(message, type = 'info', durationMs = 3500) {
        const container = ensureContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), durationMs);
    }

    return {
        show,
        success: (msg) => show(msg, 'success'),
        error:   (msg) => show(msg, 'error'),
        info:    (msg) => show(msg, 'info'),
    };
})();

// Make Toast globally available
window.Toast = Toast;
