(function () {
  function resolveRootPath() {
    const path = window.location.pathname;
    if (path.includes('/projects/') && !path.endsWith('/projects.html')) {
      return '../..';
    }
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 1 && !path.endsWith('.html')) {
      return '..';
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

    loadProjectEditorialAssets(root);
    loadProjectGalleryLightboxAssets(root);
  }

  function loadProjectEditorialAssets(root) {
    const path = window.location.pathname;
    const isProjectDetail = path.includes('/projects/') && !path.endsWith('/projects.html');
    const slug = document.body?.dataset?.project;
    if (!isProjectDetail || slug === 'casa-lomas') return;

    if (!document.querySelector('link[data-project-editorial]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${root}/css/project-editorial.css?v=1`;
      link.dataset.projectEditorial = 'true';
      document.head.append(link);
    }

    if (!document.querySelector('script[data-project-editorial]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = `${root}/js/project-editorial.js?v=helenia3`;
      script.dataset.projectEditorial = 'true';
      document.body.append(script);
    }
  }

  function loadProjectGalleryLightboxAssets(root) {
    const path = window.location.pathname;
    const isProjectDetail = path.includes('/projects/') && !path.endsWith('/projects.html');
    const slug = document.body?.dataset?.project;
    const enabled = slug === 'casa-lomas' || slug === 'casa-carmona';
    if (!isProjectDetail || !enabled) return;

    if (!document.querySelector('link[href*="project-gallery-lightbox.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${root}/css/project-gallery-lightbox.css?v=4`;
      link.dataset.projectGalleryLightbox = 'true';
      document.head.append(link);
    }

    if (!document.querySelector('script[src*="project-gallery-lightbox.js"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = `${root}/js/project-gallery-lightbox.js?v=4`;
      script.dataset.projectGalleryLightbox = 'true';
      document.body.append(script);
    }
  }

  window.SiteIncludes = { resolveRootPath, loadIncludes };
})();
