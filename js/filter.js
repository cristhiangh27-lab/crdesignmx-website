import {
  loadProjectsData,
  filterProjects,
  renderProjects,
  populateFilterOptions,
} from './project-loader.js';

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('projects-grid');
  const typeSelect = document.getElementById('filter-type');
  const locationSelect = document.getElementById('filter-location');
  const searchInput = document.getElementById('filter-search');

  if (!grid) return;

  const projects = await loadProjectsData();

  const getLang = () => window.__i18n?.lang || document.documentElement.lang || 'en';

  const getState = () => ({
    type: typeSelect?.value || '',
    location: locationSelect?.value || '',
    search: searchInput?.value || '',
  });

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
  };

  const applyFilters = () => {
    rerenderProjects(getLang(), getState());
  };

  typeSelect?.addEventListener('change', applyFilters);
  locationSelect?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);

  window.addEventListener('langchange', (event) => {
    const lang = event.detail?.lang || getLang();
    rerenderProjects(lang, getState());
  });

  rerenderProjects(getLang(), getState());
});
