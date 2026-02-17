const supportedLangs = ['en', 'es', 'de'];
const defaultLang = 'en';
let currentDict = {};

function isSupportedLang(lang) {
  return supportedLangs.includes((lang || '').toLowerCase());
}

function getInitialLang() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (isSupportedLang(urlLang)) return urlLang.toLowerCase();

  const storedLang = localStorage.getItem('lang');
  if (isSupportedLang(storedLang)) return storedLang.toLowerCase();

  return defaultLang;
}

async function loadLocale(lang) {
  const normalizedLang = isSupportedLang(lang) ? lang.toLowerCase() : defaultLang;

  try {
    const response = await fetch(`/locales/${normalizedLang}.json`);
    if (!response.ok) throw new Error(`Locale not found: ${normalizedLang}`);
    return await response.json();
  } catch (error) {
    if (normalizedLang !== defaultLang) {
      const fallbackResponse = await fetch(`/locales/${defaultLang}.json`);
      if (!fallbackResponse.ok) {
        throw new Error(`Default locale not found: ${defaultLang}`);
      }
      return await fallbackResponse.json();
    }
    throw error;
  }
}

function t(key, fallback = '') {
  return currentDict[key] ?? fallback;
}

function applyTranslations(dict) {
  currentDict = dict;
  const nodes = document.querySelectorAll('[data-i18n]');

  nodes.forEach((node) => {
    const key = node.dataset.i18n;
    const value = dict[key];
    if (typeof value !== 'string') return;

    if (node.dataset.i18nHtml === 'true') {
      node.innerHTML = value;
      return;
    }

    node.textContent = value;
  });

  const ariaLabelNodes = document.querySelectorAll('[data-i18n-aria-label]');
  ariaLabelNodes.forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    const value = dict[key];
    if (typeof value === 'string') {
      node.setAttribute('aria-label', value);
    }
  });

  const placeholderNodes = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderNodes.forEach((node) => {
    const key = node.dataset.i18nPlaceholder;
    const value = dict[key];
    if (typeof value === 'string') {
      node.setAttribute('placeholder', value);
    }
  });
}

function setHtmlLang(lang) {
  document.documentElement.lang = lang;
}

function setActiveSelector(lang) {
  const buttons = document.querySelectorAll('[data-lang]');
  buttons.forEach((button) => {
    const isActive = button.dataset.lang === lang;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

async function setLang(lang) {
  const normalizedLang = isSupportedLang(lang) ? lang.toLowerCase() : defaultLang;
  const dict = await loadLocale(normalizedLang);
  applyTranslations(dict);
  setHtmlLang(normalizedLang);
  setActiveSelector(normalizedLang);
  localStorage.setItem('lang', normalizedLang);

  const url = new URL(window.location.href);
  const paramLang = url.searchParams.get('lang');
  if (paramLang && isSupportedLang(paramLang)) {
    url.searchParams.set('lang', normalizedLang);
    window.history.replaceState({}, '', url);
  }

  window.__i18n = { lang: normalizedLang, dict, t };
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: normalizedLang } }));
}

function bindSelectorEvents() {
  const buttons = document.querySelectorAll('[data-lang]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.dataset.lang;
      setLang(lang);
    });
  });
}

async function initI18n() {
  bindSelectorEvents();
  const initialLang = getInitialLang();
  await setLang(initialLang);
}

window.I18n = {
  supportedLangs,
  getInitialLang,
  loadLocale,
  applyTranslations,
  setHtmlLang,
  setActiveSelector,
  setLang,
  initI18n,
  t,
};
