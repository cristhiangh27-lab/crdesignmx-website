const ROOT_PATH = window.location.pathname.includes('/projects/') && !window.location.pathname.endsWith('/projects.html')
  ? '../..'
  : '.';

const PROJECT_INDEX_PATH = `${ROOT_PATH}/projects/projects.json`;
const SUPPORTED_LANGS = ['en', 'es', 'de'];

const UI_COPY = {
  en: {
    kicker: 'CR Collective / selected index',
    project: 'Project',
    typology: 'Typology',
    location: 'Location',
    year: 'Year',
    dossier: 'Open project',
    archive: 'Full archive',
    loading: 'Loading projects...',
    empty: 'No projects available.',
    previous: 'Previous project',
    next: 'Next project',
    imageAlt: 'Project image',
  },
  es: {
    kicker: 'CR Collective / índice seleccionado',
    project: 'Proyecto',
    typology: 'Tipología',
    location: 'Ubicación',
    year: 'Año',
    dossier: 'Abrir proyecto',
    archive: 'Archivo completo',
    loading: 'Cargando proyectos...',
    empty: 'No hay proyectos disponibles.',
    previous: 'Proyecto anterior',
    next: 'Proyecto siguiente',
    imageAlt: 'Imagen del proyecto',
  },
  de: {
    kicker: 'CR Collective / ausgewählter Index',
    project: 'Projekt',
    typology: 'Typologie',
    location: 'Standort',
    year: 'Jahr',
    dossier: 'Projekt öffnen',
    archive: 'Gesamtarchiv',
    loading: 'Projekte werden geladen...',
    empty: 'Keine Projekte verfügbar.',
    previous: 'Vorheriges Projekt',
    next: 'Nächstes Projekt',
    imageAlt: 'Projektbild',
  },
};

const SUMMARY_COPY = {
  'casa-lomas': {
    en: 'Contemporary residence with a central kitchen and social spaces connected to the outdoors.',
    es: 'Residencia contemporánea con cocina protagonista y espacios sociales integrados al exterior.',
    de: 'Zeitgenössisches Wohnhaus mit zentraler Küche und sozialen Räumen, die mit dem Außenbereich verbunden sind.',
  },
  'casa-carmona': {
    en: 'Complete vacation-home proposal with a central kitchen and growth organized by functional zones.',
    es: 'Proyecto integral de descanso con cocina central y crecimiento organizado por zonas funcionales.',
    de: 'Ganzheitlicher Entwurf für ein Ferienhaus mit zentraler Küche und Wachstum nach funktionalen Zonen.',
  },
  't2-aicm': {
    en: 'Concept update for the North Pier at Terminal 2, with renewed interior identity, lighting and materials.',
    es: 'Actualización conceptual del Dedo Norte con nueva identidad interior, iluminación y materiales.',
    de: 'Konzeptaktualisierung für den Nordfinger der Terminal 2 mit neuer Innenidentität, Beleuchtung und Materialien.',
  },
  'aicm-t2': {
    en: 'Electrical infrastructure design and routing for private healthcare facilities, including feeders and grounding.',
    es: 'Diseño y canalización de infraestructura eléctrica para clínicas privadas, incluyendo alimentadores y tierras.',
    de: 'Planung und Führung elektrischer Infrastruktur für private Kliniken, einschließlich Zuleitungen und Erdung.',
  },
  'algarin-heights-commerce': {
    en: 'Mixed-use complex with clear circulation strategies and a contemporary commercial frontage.',
    es: 'Complejo de uso mixto con estrategias de circulación clara y fachada comercial contemporánea.',
    de: 'Mischnutzungskomplex mit klarer Erschließungsstrategie und zeitgenössischer Gewerbefassade.',
  },
  'penthouse-jaime-torres-bodet': {
    en: 'High-end residential proposal focused on natural light, sober materials and a precise spatial sequence.',
    es: 'Propuesta residencial de alta gama enfocada en luz natural, materialidad sobria y secuencia espacial precisa.',
    de: 'Hochwertiger Wohnentwurf mit Fokus auf Tageslicht, zurückhaltender Materialität und präziser Raumfolge.',
  },
  'aurora-house': {
    en: 'Contemporary residence shaped by bright patios and a fluid indoor-outdoor connection.',
    es: 'Residencia contemporánea definida por patios luminosos y conexión fluida entre interior y exterior.',
    de: 'Zeitgenössisches Wohnhaus mit hellen Höfen und fließender Verbindung zwischen Innen- und Außenraum.',
  },
  'mirador-360': {
    en: 'Tropical retreat with panoramic views, stepped terraces and a relaxed hospitality atmosphere.',
    es: 'Refugio tropical con vistas panorámicas, terrazas escalonadas y atmósfera de hospitalidad relajada.',
    de: 'Tropischer Rückzugsort mit Panoramablick, gestaffelten Terrassen und entspannter Hospitality-Atmosphäre.',
  },
};

let langChangeBound = false;
let lastOptions = {};

function getCurrentLang() {
  const lang = window.__i18n?.lang
    || localStorage.getItem('lang')
    || document.documentElement.lang
    || 'en';

  return SUPPORTED_LANGS.includes(String(lang).toLowerCase()) ? String(lang).toLowerCase() : 'en';
}

function copy(key) {
  const lang = getCurrentLang();
  return UI_COPY[lang]?.[key] || UI_COPY.en[key] || '';
}

function translate(key, fallback = '') {
  return window.__i18n?.dict?.[key] || fallback;
}

function tField(value, lang = getCurrentLang(), fallback = 'en') {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    if (typeof value[lang] === 'string') return value[lang];
    if (typeof value[fallback] === 'string') return value[fallback];
    return Object.values(value).find((entry) => typeof entry === 'string' && entry.trim()) || '';
  }
  return '';
}

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapLegacyTypeToCategoryKey(typeValue = '') {
  const raw = normalizeKey(typeValue);
  if (raw === 'residencial') return 'residential';
  if (raw === 'remodelacion-interior') return 'interior_renovation';
  if (raw === 'hospitalario') return 'healthcare';
  if (raw === 'uso-mixto') return 'mixed_use';
  if (raw === 'hospitalidad') return 'hospitality';
  if (raw === 'comercial') return 'commercial';
  if (raw === 'corporativo') return 'corporate';
  if (raw === 'cultural') return 'cultural';
  if (raw === 'casa-de-descanso') return 'vacation_home';
  return raw || 'uncategorized';
}

function categoryLabel(project, lang = getCurrentLang()) {
  const key = project.categoryKey || mapLegacyTypeToCategoryKey(tField(project.type, lang) || project.categoryLabel || '');
  return translate(`categories.${key}`, tField(project.categoryLabel, lang) || tField(project.type, lang) || key);
}

function locationLabel(project, lang = getCurrentLang()) {
  return tField(project.locationLabel, lang) || tField(project.location, lang);
}

function projectSummary(project, lang = getCurrentLang()) {
  if (project?.slug && SUMMARY_COPY[project.slug]?.[lang]) {
    return SUMMARY_COPY[project.slug][lang];
  }
  return tField(project.shortDescription, lang) || tField(project.summary, lang) || '';
}

function resolveAsset(path, fallback) {
  if (!path) return fallback;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return new URL(`${ROOT_PATH}${path}`, window.location.href).toString();
  return new URL(`${ROOT_PATH}/${path}`, window.location.href).toString();
}

async function fetchJSON(path) {
  const response = await fetch(new URL(path, window.location.href).toString());
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

async function fetchTextIfExists(path) {
  const response = await fetch(new URL(path, window.location.href).toString());
  if (response.status === 404) return '';
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.text();
}

function parseFrontmatter(rawMarkdown = '') {
  const normalized = rawMarkdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!normalized.startsWith('---\n')) return {};

  const endIndex = normalized.indexOf('\n---\n', 4);
  if (endIndex === -1) return {};

  return normalized
    .slice(4, endIndex)
    .split('\n')
    .reduce((frontmatter, line) => {
      const trimmed = line.trim();
      const separatorIndex = trimmed.indexOf(':');
      if (!trimmed || trimmed.startsWith('#') || separatorIndex === -1) return frontmatter;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
      return frontmatter;
    }, {});
}

async function loadLocalizedMarkdown(slug, lang) {
  const localized = await fetchTextIfExists(`${ROOT_PATH}/content/projects/${slug}/index.${lang}.md`);
  if (localized) return localized;

  if (lang !== 'es') {
    const fallback = await fetchTextIfExists(`${ROOT_PATH}/content/projects/${slug}/index.es.md`);
    if (fallback) return fallback;
  }

  return fetchTextIfExists(`${ROOT_PATH}/projects/${slug}/index.md`);
}

async function loadProject(slug, lang) {
  const [data, markdown] = await Promise.all([
    fetchJSON(`${ROOT_PATH}/projects/${slug}/data.json`),
    loadLocalizedMarkdown(slug, lang).catch(() => ''),
  ]);

  const frontmatter = parseFrontmatter(markdown);
  return {
    ...data,
    slug,
    href: data.href || `${ROOT_PATH}/projects/${slug}/`,
    title: frontmatter.title || data.title,
    locationLabel: frontmatter.location || data.locationLabel || data.location,
    categoryLabel: frontmatter.category || data.categoryLabel || data.type,
    shortDescription: frontmatter.excerpt || data.shortDescription || data.summary,
    year: frontmatter.year || data.year,
  };
}

async function loadSelectedProjects(limit) {
  const lang = getCurrentLang();
  const index = await fetchJSON(PROJECT_INDEX_PATH);
  const entries = Array.isArray(index.projects) ? index.projects : [];
  const slugs = entries
    .map((entry) => (typeof entry === 'string' ? entry : entry.slug))
    .filter(Boolean)
    .slice(0, limit);

  const loaded = await Promise.allSettled(slugs.map((slug) => loadProject(slug, lang)));
  return loaded
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
}

function renderLoading(container) {
  container.className = 'works-console works-console--loading';
  container.innerHTML = `
    <div class="works-console__loading">
      <span>${escapeHTML(translate('featured.loading', copy('loading')))}</span>
      <i aria-hidden="true"></i>
      <i aria-hidden="true"></i>
      <i aria-hidden="true"></i>
    </div>
  `;
}

function getProjectImage(project) {
  return resolveAsset(project.coverImage, `${ROOT_PATH}/projects/${project.slug}/img/preview.jpg`);
}

function renderConsole(container, projects, activeSlug, selectorScrollLeft = 0) {
  const lang = getCurrentLang();
  const activeProject = projects.find((project) => project.slug === activeSlug) || projects[0];
  const activeIndex = projects.findIndex((project) => project.slug === activeProject.slug);
  const projectNumber = String(activeIndex + 1).padStart(2, '0');
  const totalNumber = String(projects.length).padStart(2, '0');
  const title = tField(activeProject.title, lang) || translate('project.card.titleFallback', copy('project'));
  const type = categoryLabel(activeProject, lang);
  const location = locationLabel(activeProject, lang);
  const summary = projectSummary(activeProject, lang);
  const cta = translate('project.card.cta', copy('dossier'));
  const viewAll = translate('featured.viewAll', copy('archive'));

  container.className = 'works-console';
  container.dataset.activeSlug = activeProject.slug;
  container.innerHTML = `
    <div class="works-console__header">
      <div>
        <p class="works-console__kicker">${escapeHTML(copy('kicker'))}</p>
        <h3>${escapeHTML(translate('featured.title', 'Selected Works'))}</h3>
      </div>
      <p>${escapeHTML(translate('featured.lead', 'A curated view of residential, commercial, interior and conceptual projects.'))}</p>
    </div>

    <div class="works-console__stage" data-active-panel>
      <a class="works-console__media" href="${escapeHTML(activeProject.href)}" aria-label="${escapeHTML(`${cta}: ${title}`)}">
        <img src="${escapeHTML(getProjectImage(activeProject))}" alt="${escapeHTML(title || copy('imageAlt'))}" width="1440" height="980" loading="eager" decoding="async" fetchpriority="high">
        <span class="works-console__image-code" aria-hidden="true">${projectNumber}/${totalNumber}</span>
      </a>
      <article class="works-console__panel">
        <div class="works-console__panel-top">
          <span>${escapeHTML(copy('project'))}</span>
          <strong>${projectNumber}/${totalNumber}</strong>
        </div>
        <p class="works-console__type">${escapeHTML(type)}</p>
        <h4>${escapeHTML(title)}</h4>
        <p class="works-console__summary">${escapeHTML(summary)}</p>
        <dl class="works-console__meta">
          <div><dt>${escapeHTML(copy('location'))}</dt><dd>${escapeHTML(location || '-')}</dd></div>
          <div><dt>${escapeHTML(copy('year'))}</dt><dd>${escapeHTML(activeProject.year || '-')}</dd></div>
          <div><dt>${escapeHTML(copy('typology'))}</dt><dd>${escapeHTML(type || '-')}</dd></div>
        </dl>
        <div class="works-console__actions">
          <a class="works-console__cta" href="${escapeHTML(activeProject.href)}">${escapeHTML(cta)}</a>
          <a class="works-console__archive" href="${ROOT_PATH}/projects.html">${escapeHTML(viewAll)}</a>
        </div>
        <div class="works-console__controls" aria-label="${escapeHTML(translate('featured.title', 'Selected Works'))}">
          <button type="button" data-direction="-1" aria-label="${escapeHTML(translate('featured.prev', copy('previous')))}">&lt;</button>
          <button type="button" data-direction="1" aria-label="${escapeHTML(translate('featured.next', copy('next')))}">&gt;</button>
        </div>
      </article>
    </div>

    <div class="works-console__selector" aria-label="${escapeHTML(translate('featured.title', 'Selected Works'))}">
      ${projects.map((project, index) => {
        const isActive = project.slug === activeProject.slug;
        const itemTitle = tField(project.title, lang) || translate('project.card.titleFallback', copy('project'));
        const itemType = categoryLabel(project, lang);
        const itemLocation = locationLabel(project, lang);
        const itemNumber = String(index + 1).padStart(2, '0');
        return `
          <button class="works-console__card${isActive ? ' is-active' : ''}" type="button" data-slug="${escapeHTML(project.slug)}" aria-pressed="${String(isActive)}">
            <span class="works-console__card-index">${itemNumber}</span>
            <span class="works-console__thumb">
              <img src="${escapeHTML(getProjectImage(project))}" alt="" width="180" height="120" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async">
            </span>
            <span class="works-console__card-copy">
              <strong>${escapeHTML(itemTitle)}</strong>
              <small>${escapeHTML([itemLocation, project.year, itemType].filter(Boolean).join(' / '))}</small>
            </span>
          </button>
        `;
      }).join('')}
    </div>
  `;

  const selector = container.querySelector('.works-console__selector');
  if (selector) selector.scrollLeft = selectorScrollLeft;

  container.querySelectorAll('[data-slug]').forEach((button) => {
    button.addEventListener('click', () => {
      const currentScrollLeft = container.querySelector('.works-console__selector')?.scrollLeft || 0;
      renderConsole(container, projects, button.dataset.slug, currentScrollLeft);
    });
  });

  container.querySelectorAll('[data-direction]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = Number(button.dataset.direction) || 1;
      const nextIndex = (activeIndex + direction + projects.length) % projects.length;
      const currentScrollLeft = container.querySelector('.works-console__selector')?.scrollLeft || 0;
      renderConsole(container, projects, projects[nextIndex].slug, currentScrollLeft);
    });
  });
}

export async function initSelectedWorksRedesign(options = {}) {
  const {
    container = document.getElementById('featured-projects'),
    totalVisible = 8,
  } = options;

  if (!container) return;
  lastOptions = { container, totalVisible };

  if (!langChangeBound) {
    window.addEventListener('langchange', () => initSelectedWorksRedesign(lastOptions));
    langChangeBound = true;
  }

  const renderId = `${Date.now()}-${Math.random()}`;
  container.dataset.renderId = renderId;
  renderLoading(container);

  try {
    const projects = await loadSelectedProjects(totalVisible);
    if (container.dataset.renderId !== renderId) return;

    if (!projects.length) {
      container.className = 'works-console';
      container.innerHTML = `<p class="works-console__empty">${escapeHTML(translate('featured.empty', copy('empty')))}</p>`;
      return;
    }

    renderConsole(container, projects, container.dataset.activeSlug);
  } catch (error) {
    console.error('Could not render selected works', error);
    container.className = 'works-console';
    container.innerHTML = `<p class="works-console__empty">${escapeHTML(translate('featured.empty', copy('empty')))}</p>`;
  }
}
