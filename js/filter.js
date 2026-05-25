import {
  loadProjectsData,
  filterProjects,
  renderProjects,
  populateFilterOptions,
} from './project-loader.js?v=9f7a5e1';

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('projects-grid');
  const typeSelect = document.getElementById('filter-type');
  const locationSelect = document.getElementById('filter-location');
  const searchInput = document.getElementById('filter-search');

  if (!grid) return;

  let projects = await loadProjectsData();

  const getLang = () => window.__i18n?.lang || document.documentElement.lang || 'en';

  const getState = () => ({
    type: typeSelect?.value || '',
    location: locationSelect?.value || '',
    search: searchInput?.value || '',
  });

  const readSummaryFallback = (value, lang) => {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';
    return value[lang] || value.es || value.en || Object.values(value).find((entry) => typeof entry === 'string') || '';
  };

  const restoreEmptySummaries = (items, lang) => {
    const cards = [...grid.querySelectorAll('.project-card')];
    cards.forEach((card, index) => {
      const summary = card.querySelector('.card-body p');
      if (!summary || summary.textContent.trim()) return;
      const project = items[index];
      const text = readSummaryFallback(project?.shortDescription, lang) || readSummaryFallback(project?.summary, lang);
      if (text) summary.textContent = text;
    });
  };

  const rerenderProjects = (lang = getLang(), incomingState = getState()) => {
    populateFilterOptions(projects, lang, incomingState);
    if (searchInput && typeof incomingState.search === 'string') {
      searchInput.value = incomingState.search;
    }

    const filtered = filterProjects(projects, {
      type: incomingState.type,
      location: incomingState.location,
      search: incomingState.search,
    }, lang);

    renderProjects(grid, filtered, lang);
    restoreEmptySummaries(filtered, lang);
  };

  const applyFilters = () => {
    rerenderProjects(getLang(), getState());
  };

  typeSelect?.addEventListener('change', applyFilters);
  locationSelect?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);

  window.addEventListener('langchange', async (event) => {
    const lang = event.detail?.lang || getLang();
    projects = await loadProjectsData(lang);
    rerenderProjects(lang, getState());
  });

  rerenderProjects(getLang(), getState());
});
