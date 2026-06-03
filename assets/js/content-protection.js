(function () {
  if (window.__CRContentProtectionLoaded) return;
  window.__CRContentProtectionLoaded = true;

  const EDITABLE_SELECTOR = [
    'input',
    'textarea',
    'select',
    'option',
    '[contenteditable]',
    '[data-copy-allowed]',
  ].join(',');

  const BLOCKED_SHORTCUTS = new Set(['a', 'c', 'x', 's', 'u', 'p']);

  function isEditableTarget(target) {
    return target instanceof Element && Boolean(target.closest(EDITABLE_SELECTOR));
  }

  function blockEvent(event) {
    if (isEditableTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function blockClipboard(event) {
    if (isEditableTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.clipboardData) {
      event.clipboardData.setData('text/plain', '');
    }
  }

  function blockShortcuts(event) {
    if (isEditableTarget(event.target)) return;

    const key = String(event.key || '').toLowerCase();
    const commandKey = event.ctrlKey || event.metaKey;
    const devtoolsChord = commandKey && event.shiftKey && (key === 'i' || key === 'j' || key === 'c');

    if ((commandKey && BLOCKED_SHORTCUTS.has(key)) || devtoolsChord || key === 'f12') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function markMedia(root = document) {
    root.querySelectorAll?.('img, video, canvas').forEach((node) => {
      node.setAttribute('draggable', 'false');
    });
  }

  function injectStyles() {
    if (document.getElementById('cr-content-protection-styles')) return;

    const style = document.createElement('style');
    style.id = 'cr-content-protection-styles';
    style.textContent = `
      html.cr-content-protected,
      html.cr-content-protected body {
        -webkit-touch-callout: none;
      }

      html.cr-content-protected body :not(input):not(textarea):not(select):not(option):not([contenteditable]):not([data-copy-allowed]) {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      html.cr-content-protected input,
      html.cr-content-protected textarea,
      html.cr-content-protected select,
      html.cr-content-protected [contenteditable],
      html.cr-content-protected [data-copy-allowed] {
        -webkit-touch-callout: default;
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }

      html.cr-content-protected img,
      html.cr-content-protected video,
      html.cr-content-protected canvas {
        -webkit-user-drag: none;
        user-drag: none;
      }
    `;
    document.head.append(style);
    document.documentElement.classList.add('cr-content-protected');
    document.documentElement.dataset.contentProtection = 'loaded';
  }

  injectStyles();
  markMedia();

  document.addEventListener('contextmenu', blockEvent, true);
  document.addEventListener('copy', blockClipboard, true);
  document.addEventListener('cut', blockClipboard, true);
  document.addEventListener('selectstart', blockEvent, true);
  document.addEventListener('dragstart', blockEvent, true);
  document.addEventListener('keydown', blockShortcuts, true);
  document.addEventListener('DOMContentLoaded', () => markMedia(), { once: true });

  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) markMedia(node);
        });
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
