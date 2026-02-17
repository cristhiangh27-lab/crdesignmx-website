(function () {
  function resolveRootPath() {
    const path = window.location.pathname;
    if (path.includes('/projects/') && !path.endsWith('/projects.html')) {
      return '../..';
    }
    return '.';
  }

  function normalizeCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('/projects/') && !path.endsWith('/projects.html')) return 'projects';
    if (path.endsWith('/projects.html')) return 'projects';
    if (path.endsWith('/services.html')) return 'services';
    if (path.endsWith('/about.html')) return 'about';
    if (path.endsWith('/contact.html')) return 'contact';
    return 'home';
  }

  async function loadIncludes() {
    const root = resolveRootPath();
    window.__SITE_ROOT__ = root;

    const includeNodes = document.querySelectorAll('[data-include]');
    await Promise.all([...includeNodes].map(async (node) => {
      const partial = node.dataset.include;
      const res = await fetch(`${root}/partials/${partial}.html`);
      if (!res.ok) return;
      const html = (await res.text()).replaceAll('{{root}}', root);
      node.outerHTML = html;
    }));

    const current = normalizeCurrentPage();
    const currentNav = document.querySelector(`.primary-nav [data-nav-key="${current}"]`);
    if (currentNav) currentNav.setAttribute('aria-current', 'page');

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  window.SiteIncludes = { resolveRootPath, loadIncludes };
})();
