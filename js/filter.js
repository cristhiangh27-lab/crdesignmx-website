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
  populateFilterOptions(projects);

  const applyFilters = () => {
    const filtered = filterProjects(projects, {
      type: typeSelect?.value || '',
      location: locationSelect?.value || '',
      search: searchInput?.value || '',
    });
    renderProjects(grid, filtered);
  };

  typeSelect?.addEventListener('change', applyFilters);
  locationSelect?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);

  renderProjects(grid, projects);
});
