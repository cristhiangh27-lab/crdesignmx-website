const supportedLangs = ['en', 'es', 'de'];
const defaultLang = 'en';
let currentDict = {};

function resolveRootPath() {
  if (window.__SITE_ROOT__) return window.__SITE_ROOT__;
  const path = window.location.pathname;
  if (path.includes('/projects/') && !path.endsWith('/projects.html')) {
    return '../..';
  }
  return '.';
}

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
  const root = resolveRootPath();

  try {
    const response = await fetch(`${root}/locales/${normalizedLang}.json`);
    if (!response.ok) throw new Error(`Locale not found: ${normalizedLang}`);
    return await response.json();
  } catch (error) {
    if (normalizedLang !== defaultLang) {
      const fallbackResponse = await fetch(`${root}/locales/${defaultLang}.json`);
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

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const value = dict[node.dataset.i18n];
    if (typeof value === 'string') node.textContent = value;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((node) => {
    const value = dict[node.dataset.i18nHtml];
    if (typeof value === 'string') node.innerHTML = value;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    const value = dict[node.dataset.i18nPlaceholder];
    if (typeof value === 'string') node.setAttribute('placeholder', value);
  });

  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    const value = dict[node.dataset.i18nTitle];
    if (typeof value === 'string') node.setAttribute('title', value);
  });

  document.querySelectorAll('[data-i18n-aria], [data-i18n-aria-label]').forEach((node) => {
    const key = node.dataset.i18nAria || node.dataset.i18nAriaLabel;
    const value = dict[key];
    if (typeof value === 'string') node.setAttribute('aria-label', value);
  });
}

function setHtmlLang(lang) {
  document.documentElement.lang = lang;
}

function setActiveSelector(lang) {
  document.querySelectorAll('[data-lang]').forEach((button) => {
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
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => {
      setLang(button.dataset.lang);
    });
  });
}

async function initI18n() {
  bindSelectorEvents();
  await setLang(getInitialLang());
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
