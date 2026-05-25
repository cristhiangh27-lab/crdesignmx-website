(function () {
  const page = document.body;
  if (!page || !page.classList.contains('projects-page')) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const summaryCache = new Map();
  const supportedLangs = ['en', 'es', 'de'];
  const pageTranslations = {
    en: {
      'projects.kicker': 'Portfolio',
      'projects.title': 'Selected Works',
      'projects.subtitle': 'A living archive of residential, commercial, interior and conceptual projects developed through design, BIM documentation, visualization and site experience.',
      'projects.heroPanelAria': 'Portfolio summary',
      'projects.heroMetaLabel': 'Evolving portfolio',
      'projects.heroMetaValue': '16 project files',
      'projects.heroMetaCopy': 'A curated reading of built work, concepts and technical collaborations, with visual files added as each story is completed.',
      'projects.heroScopeLabel': 'Method',
      'projects.heroScopeValue': 'Design + BIM + visualization',
      'projects.heroRegionLabel': 'Base',
      'projects.heroRegionValue': 'Mexico + international collaborations',
      'projects.archiveEyebrow': 'Work map',
      'projects.archiveTitle': 'Read the portfolio by scale, place and purpose.',
      'projects.archiveCopy': 'Filter by typology or location, then open the project file that matches the scale, phase and atmosphere you want to explore.',
      'projects.toolbarNote': 'Project files grow with photographs, drawings and notes as each story is completed.',
      'projects.filters.aria': 'Project filters',
      'projects.filters.type': 'Filter by category',
      'projects.filters.location': 'Filter by location',
      'projects.search.placeholder': 'Search archive by title, location, type, or keyword',
      'projects.search.aria': 'Search projects',
    },
    es: {
      'projects.kicker': 'Portafolio',
      'projects.title': 'Obras seleccionadas',
      'projects.subtitle': 'Un archivo vivo de proyectos residenciales, comerciales, interiores y conceptuales desarrollados mediante diseño, documentación BIM, visualización y experiencia en obra.',
      'projects.heroPanelAria': 'Resumen del portafolio',
      'projects.heroMetaLabel': 'Portafolio en evolución',
      'projects.heroMetaValue': '16 fichas de proyecto',
      'projects.heroMetaCopy': 'Una lectura curada de obra construida, conceptos y colaboraciones técnicas, con archivos visuales que se suman conforme cada historia se completa.',
      'projects.heroScopeLabel': 'Método',
      'projects.heroScopeValue': 'Diseño + BIM + visualización',
      'projects.heroRegionLabel': 'Base',
      'projects.heroRegionValue': 'México + colaboraciones internacionales',
      'projects.archiveEyebrow': 'Mapa de obras',
      'projects.archiveTitle': 'Lee el portafolio por escala, lugar y propósito.',
      'projects.archiveCopy': 'Filtra por tipología o ubicación y abre la ficha que mejor corresponda con la escala, etapa y atmósfera que quieres explorar.',
      'projects.toolbarNote': 'Las fichas crecen con fotografías, planos y memorias conforme cada historia se completa.',
      'projects.filters.aria': 'Filtros de proyectos',
      'projects.filters.type': 'Filtrar por tipología',
      'projects.filters.location': 'Filtrar por ubicación',
      'projects.search.placeholder': 'Buscar en el archivo por título, ubicación, tipología o palabra clave',
      'projects.search.aria': 'Buscar proyectos',
    },
    de: {
      'projects.kicker': 'Portfolio',
      'projects.title': 'Ausgewählte Projekte',
      'projects.subtitle': 'Ein lebendiges Archiv aus Wohn-, Gewerbe-, Innenraum- und Konzeptprojekten, entwickelt durch Entwurf, BIM-Dokumentation, Visualisierung und Baustellenerfahrung.',
      'projects.heroPanelAria': 'Portfolioübersicht',
      'projects.heroMetaLabel': 'Portfolio in Entwicklung',
      'projects.heroMetaValue': '16 Projektakten',
      'projects.heroMetaCopy': 'Eine kuratierte Lesart gebauter Arbeiten, Konzepte und technischer Kooperationen, ergänzt durch visuelle Dateien, sobald jede Geschichte vollständig wird.',
      'projects.heroScopeLabel': 'Methode',
      'projects.heroScopeValue': 'Entwurf + BIM + Visualisierung',
      'projects.heroRegionLabel': 'Basis',
      'projects.heroRegionValue': 'Mexiko + internationale Kooperationen',
      'projects.archiveEyebrow': 'Projektkarte',
      'projects.archiveTitle': 'Lesen Sie das Portfolio nach Maßstab, Ort und Zweck.',
      'projects.archiveCopy': 'Filtern Sie nach Typologie oder Standort und öffnen Sie die Projektakte, die zu Maßstab, Phase und Atmosphäre passt.',
      'projects.toolbarNote': 'Projektakten wachsen mit Fotos, Plänen und Notizen, sobald jede Geschichte vollständig wird.',
      'projects.filters.aria': 'Projektfilter',
      'projects.filters.type': 'Nach Typologie filtern',
      'projects.filters.location': 'Nach Standort filtern',
      'projects.search.placeholder': 'Archiv nach Titel, Standort, Typologie oder Stichwort durchsuchen',
      'projects.search.aria': 'Projekte suchen',
    },
  };
  let revealObserver;

  function setBackdropState() {
    if (reduceMotion.matches) {
      page.style.setProperty('--projects-backdrop-shift', '0px');
      page.style.setProperty('--projects-backdrop-opacity', '0.14');
      return;
    }

    const scrollY = window.scrollY || 0;
    const shift = Math.max(-120, scrollY * -0.08);
    const opacity = Math.max(0.1, 0.22 - scrollY / 5200);
    page.style.setProperty('--projects-backdrop-shift', `${shift.toFixed(1)}px`);
    page.style.setProperty('--projects-backdrop-opacity', opacity.toFixed(3));
  }

  function observeRevealItem(item, index = 0) {
    if (!item || item.dataset.projectsRevealBound === 'true') return;
    item.dataset.projectsRevealBound = 'true';

    if (reduceMotion.matches || !revealObserver) {
      item.classList.add('is-visible');
      return;
    }

    item.style.setProperty('--reveal-delay', `${Math.min(index * 36, 220)}ms`);
    revealObserver.observe(item);
  }

  function bindProjectCards() {
    const cards = [...document.querySelectorAll('.projects-page .project-card')];
    const grid = document.getElementById('projects-grid');

    if (grid) {
      grid.dataset.count = String(cards.length);
      grid.setAttribute('aria-busy', 'false');
    }

    cards.forEach((card, index) => {
      decorateProjectCard(card);
      observeRevealItem(card, index);
    });

    hydrateProjectSummaries(cards);
  }

  function getRootPath() {
    return window.location.pathname.includes('/projects/') && !window.location.pathname.endsWith('/projects.html')
      ? '../..'
      : '.';
  }

  function getLang() {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    const candidates = [
      window.__i18n?.lang,
      urlLang,
      localStorage.getItem('lang'),
      document.documentElement.lang,
    ];

    return candidates.find((lang) => supportedLangs.includes((lang || '').toLowerCase())) || 'en';
  }

  function applyPageTranslations(lang = getLang()) {
    const normalizedLang = supportedLangs.includes((lang || '').toLowerCase()) ? lang.toLowerCase() : 'en';
    const dict = pageTranslations[normalizedLang] || pageTranslations.en;

    if (window.__i18n?.dict) {
      Object.assign(window.__i18n.dict, dict);
    }

    document.querySelectorAll('.projects-page [data-i18n]').forEach((node) => {
      const value = dict[node.dataset.i18n];
      if (typeof value === 'string') node.textContent = value;
    });

    document.querySelectorAll('.projects-page [data-i18n-placeholder]').forEach((node) => {
      const value = dict[node.dataset.i18nPlaceholder];
      if (typeof value === 'string') node.setAttribute('placeholder', value);
    });

    document.querySelectorAll('.projects-page [data-i18n-aria], .projects-page [data-i18n-aria-label]').forEach((node) => {
      const key = node.dataset.i18nAria || node.dataset.i18nAriaLabel;
      const value = dict[key];
      if (typeof value === 'string') node.setAttribute('aria-label', value);
    });
  }

  function getProjectSlug(card) {
    if (card.dataset.projectSlug) return card.dataset.projectSlug;
    try {
      const url = new URL(card.getAttribute('href') || '', window.location.href);
      const match = url.pathname.match(/\/projects\/([^/]+)/);
      return match?.[1] || '';
    } catch (error) {
      return '';
    }
  }

  function parseFrontmatterExcerpt(markdown = '') {
    const normalized = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    if (!normalized.startsWith('---\n')) return '';
    const endIndex = normalized.indexOf('\n---\n', 4);
    if (endIndex === -1) return '';
    const frontmatter = normalized.slice(4, endIndex);
    const excerptLine = frontmatter
      .split('\n')
      .find((line) => line.trim().toLowerCase().startsWith('excerpt:'));
    if (!excerptLine) return '';
    return excerptLine
      .slice(excerptLine.indexOf(':') + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
  }

  function readLocalizedValue(value, lang) {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';
    return value[lang] || value.es || value.en || Object.values(value).find((entry) => typeof entry === 'string') || '';
  }

  async function fetchProjectSummary(slug, lang) {
    const cacheKey = `${lang}:${slug}`;
    if (summaryCache.has(cacheKey)) return summaryCache.get(cacheKey);

    const root = getRootPath();
    const candidates = [
      `${root}/content/projects/${slug}/index.${lang}.md`,
      `${root}/content/projects/${slug}/index.es.md`,
      `${root}/projects/${slug}/data.json`,
    ];

    let summary = '';
    for (const path of candidates) {
      try {
        const response = await fetch(path);
        if (!response.ok) continue;
        if (path.endsWith('.json')) {
          const data = await response.json();
          summary = readLocalizedValue(data.shortDescription, lang) || readLocalizedValue(data.summary, lang);
        } else {
          summary = parseFrontmatterExcerpt(await response.text());
        }
        if (summary) break;
      } catch (error) {
        summary = '';
      }
    }

    summaryCache.set(cacheKey, summary);
    return summary;
  }

  function decorateProjectCard(card) {
    const body = card.querySelector('.card-body');
    const summary = body?.querySelector('p');
    const image = card.querySelector('.project-media img');

    if (summary) summary.classList.add('project-card__summary');
    if (image?.getAttribute('src')?.includes('/img/placeholders/')) {
      card.classList.add('project-card--placeholder');
    }

    if (body && !body.querySelector('.project-card__archive-cta')) {
      const cta = document.createElement('span');
      cta.className = 'project-card__archive-cta';
      cta.textContent = window.__i18n?.dict?.['project.card.cta'] || 'View project';
      body.append(cta);
    }
  }

  async function hydrateProjectSummaries(cards) {
    const lang = getLang();
    const pending = cards
      .map((card) => ({ card, summary: card.querySelector('.card-body p'), slug: getProjectSlug(card) }))
      .filter(({ summary, slug }) => summary && slug && !summary.textContent.trim());

    await Promise.all(pending.map(async ({ summary, slug }) => {
      const text = await fetchProjectSummary(slug, lang);
      if (text && !summary.textContent.trim()) {
        summary.textContent = text;
      }
    }));
  }

  function initReveal() {
    const revealItems = [...document.querySelectorAll('.projects-reveal')];

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      bindProjectCards();
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    revealItems.forEach((item, index) => observeRevealItem(item, index));
    bindProjectCards();
  }

  function watchProjectGrid() {
    const grid = document.getElementById('projects-grid');
    if (!grid || !('MutationObserver' in window)) return;

    const observer = new MutationObserver(() => {
      grid.setAttribute('aria-busy', 'false');
      bindProjectCards();
    });

    observer.observe(grid, { childList: true });
  }

  function initCardFocusReset() {
    document.addEventListener('pointerdown', (event) => {
      const card = event.target.closest?.('.projects-page .project-card');
      if (!card) return;
      card.classList.add('is-pressed');
      window.setTimeout(() => card.classList.remove('is-pressed'), 180);
    });
  }

  function initBackdrop() {
    let ticking = false;
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setBackdropState();
        ticking = false;
      });
    };

    setBackdropState();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    reduceMotion.addEventListener?.('change', requestUpdate);
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyPageTranslations();
    initBackdrop();
    initReveal();
    watchProjectGrid();
    initCardFocusReset();
  });

  window.addEventListener('langchange', () => {
    applyPageTranslations();
    window.setTimeout(bindProjectCards, 0);
  });
})();
