const ROOT_PATH = window.location.pathname.includes('/projects/') && !window.location.pathname.endsWith('/projects.html')
  ? '../..'
  : '.';

const PROJECT_INDEX_PATH = `${ROOT_PATH}/projects/projects.json`;

function translate(key, fallback) {
  return window.__i18n?.dict?.[key] || fallback;
}



function getCurrentLang() {
  return window.__i18n?.lang
    || localStorage.getItem('lang')
    || document.documentElement.lang
    || 'en';
}

function parseFrontmatterMarkdown(rawMarkdown = '') {
  const normalized = rawMarkdown.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---\n')) {
    return { frontmatter: {}, body: normalized };
  }

  const endIndex = normalized.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { frontmatter: {}, body: normalized };
  }

  const fmBlock = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + 5);
  const frontmatter = {};

  fmBlock.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  });

  return { frontmatter, body };
}

export function tField(value, lang, fallback = 'en') {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    if (typeof value[lang] === 'string') return value[lang];
    if (typeof value[fallback] === 'string') return value[fallback];
    const firstAvailable = Object.values(value).find((entry) => typeof entry === 'string' && entry.trim());
    return firstAvailable || '';
  }
  return '';
}

function normalizeKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

function getCategoryKey(project) {
  if (typeof project.categoryKey === 'string' && project.categoryKey.trim()) {
    return project.categoryKey.trim();
  }
  const typeValue = tField(project.type, getCurrentLang()) || '';
  return mapLegacyTypeToCategoryKey(typeValue);
}

function getLocationKey(project) {
  if (typeof project.locationKey === 'string' && project.locationKey.trim()) {
    return project.locationKey.trim();
  }
  const locationValue = tField(project.locationLabel, getCurrentLang()) || tField(project.location, getCurrentLang()) || '';
  return normalizeKey(locationValue);
}

function getCategoryLabel(project, lang) {
  const key = getCategoryKey(project);
  return translate(`categories.${key}`, tField(project.categoryLabel, lang) || tField(project.type, lang) || key);
}

function getLocationLabel(project, lang) {
  return tField(project.locationLabel, lang) || tField(project.location, lang);
}

function getProjectSummary(project, lang = getCurrentLang()) {
  const summaryValue = project?.shortDescription ?? project?.summary ?? '';
  if (lang === 'de' && typeof summaryValue === 'string') return '';
  return tField(project.shortDescription, lang) || tField(project.summary, lang) || '';
}

function resolveAsset(path, fallback) {
  if (!path) return fallback;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return new URL(`${ROOT_PATH}${path}`, window.location.href).toString();
  return new URL(`${ROOT_PATH}/${path}`, window.location.href).toString();
}

async function fetchJSON(path) {
  const url = new URL(path, window.location.href).toString();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url} (${response.status})`);
  }
  return response.json();
}

async function fetchText(path) {
  const url = new URL(path, window.location.href).toString();
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url} (${response.status})`);
  }
  return response.text();
}

async function fetchTextIfExists(path) {
  const url = new URL(path, window.location.href).toString();
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url} (${response.status})`);
  }
  return response.text();
}

function markdownToHtml(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let html = '';
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }

    if (/^#\s+/.test(trimmed)) {
      closeList();
      html += `<h1>${trimmed.replace(/^#\s+/, '')}</h1>`;
    } else if (/^##\s+/.test(trimmed)) {
      closeList();
      html += `<h2>${trimmed.replace(/^##\s+/, '')}</h2>`;
    } else if (/^-\s+/.test(trimmed)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${trimmed.replace(/^-\s+/, '')}</li>`;
    } else if (/^!\[[^\]]*\]\([^)]*\)/.test(trimmed)) {
      closeList();
      const match = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) {
        const alt = match[1] || 'Imagen del proyecto';
        const src = match[2];
        html += `<p><img src="${src}" alt="${alt}"></p>`;
      }
    } else {
      closeList();
      html += `<p>${trimmed}</p>`;
    }
  }

  closeList();
  return html;
}

function extractGalleryImages(md) {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images = [];
  let match;
  while ((match = regex.exec(md)) !== null) {
    images.push({ alt: match[1] || 'Imagen del proyecto', src: match[2] });
  }
  return images;
}

async function imageExists(path) {
  try {
    const res = await fetch(path, { method: 'HEAD' });
    return res.ok;
  } catch (error) {
    console.warn('No se pudo verificar la imagen', path, error);
    return false;
  }
}

function buildCandidateNames(images = []) {
  const names = new Set(images);
  const presets = ['preview', 'hero', 'cover', 'XMPL1'];
  presets.forEach((p) => names.add(p));
  for (let i = 1; i <= 24; i += 1) {
    names.add(String(i));
    names.add(String(i).padStart(2, '0'));
  }
  return [...names];
}

async function discoverImages(slug, declaredImages = []) {
  const candidates = buildCandidateNames(declaredImages);
  const extensions = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
  const found = [];

  for (const name of candidates) {
    for (const ext of extensions) {
      const src = `${ROOT_PATH}/projects/${slug}/img/${name}.${ext}`;
      if (await imageExists(src)) {
        found.push({ alt: 'Imagen del proyecto', src });
      }
    }
  }

  return found;
}

async function loadLocalizedProjectMarkdown(slug, lang = getCurrentLang()) {
  const activeLang = (lang || 'es').toLowerCase();
  const localizedPath = `${ROOT_PATH}/content/projects/${slug}/index.${activeLang}.md`;
  const fallbackPath = `${ROOT_PATH}/content/projects/${slug}/index.es.md`;
  const legacyPath = `${ROOT_PATH}/projects/${slug}/index.md`;

  const localized = await fetchTextIfExists(localizedPath);
  if (localized) {
    return { markdown: localized, resolvedLang: activeLang, path: localizedPath };
  }

  if (activeLang !== 'es') {
    const fallback = await fetchTextIfExists(fallbackPath);
    if (fallback) {
      return { markdown: fallback, resolvedLang: 'es', path: fallbackPath };
    }
  }

  const legacy = await fetchTextIfExists(legacyPath);
  if (legacy) {
    return { markdown: legacy, resolvedLang: 'legacy', path: legacyPath };
  }

  throw new Error(`No se encontró markdown para ${slug} (${activeLang})`);
}

async function loadProjectMarkdown(slug, lang = getCurrentLang()) {
  const { markdown } = await loadLocalizedProjectMarkdown(slug, lang);
  return markdown;
}

async function loadProjectData(slug, lang = getCurrentLang()) {
  const data = await fetchJSON(`${ROOT_PATH}/projects/${slug}/data.json`);
  const localizedMarkdown = await loadProjectMarkdown(slug, lang);
  const { frontmatter } = parseFrontmatterMarkdown(localizedMarkdown);

  const localizedFields = {
    title: frontmatter.title || data.title,
    locationLabel: frontmatter.location || data.locationLabel || data.location,
    categoryLabel: frontmatter.category || data.categoryLabel || data.type,
    shortDescription: frontmatter.excerpt || data.shortDescription || data.summary,
    summary: frontmatter.excerpt || data.summary,
    year: frontmatter.year || data.year,
  };

  return { ...data, ...localizedFields, slug };
}

async function loadProjectIndex() {
  try {
    const index = await fetchJSON(PROJECT_INDEX_PATH);
    if (Array.isArray(index.projects)) {
      return index.projects.map((entry) => (typeof entry === 'string' ? { slug: entry } : entry));
    }
    return [];
  } catch (error) {
    console.error(`No se pudo cargar el índice de proyectos desde ${PROJECT_INDEX_PATH}`, error);
    return [];
  }
}

export async function loadProjectsData(lang = getCurrentLang()) {
  const entries = await loadProjectIndex();
  const projects = [];
  for (const entry of entries) {
    const slug = entry.slug || entry;
    try {
      const data = await loadProjectData(slug, lang);
      projects.push(data);
    } catch (error) {
      console.warn(`No se pudo cargar el proyecto ${slug}`, error);
    }
  }
  return projects;
}

function createMediaFallback() {
  const fallback = document.createElement('div');
  fallback.className = 'img-fallback';

  const label = document.createElement('span');
  label.className = 'img-fallback-label';
  label.textContent = translate('project.card.titleFallback', 'Project');

  fallback.append(label);
  return fallback;
}

function createProjectCard(project, lang = getCurrentLang()) {
  const { slug, year, coverImage, href } = project;
  const title = tField(project.title, lang);
  const location = getLocationLabel(project, lang);
  const type = getCategoryLabel(project, lang);
  const summary = getProjectSummary(project, lang);
  const link = document.createElement('a');
  link.className = 'project-card';
  link.href = href || `${ROOT_PATH}/projects/${slug}/`;

  const media = document.createElement('div');
  media.className = 'project-media';

  if (coverImage) {
    const img = document.createElement('img');
    img.alt = title || 'Proyecto';
    img.src = resolveAsset(coverImage, `${ROOT_PATH}/img/${slug}/preview.jpg`);
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 640;
    img.height = 360;
    img.addEventListener('error', () => {
      img.remove();
      if (!media.querySelector('.img-fallback')) {
        media.prepend(createMediaFallback());
      }
    });
    media.append(img);
  } else {
    media.append(createMediaFallback());
  }

  const overlay = document.createElement('div');
  overlay.className = 'project-overlay';

  const overlayContent = document.createElement('div');
  overlayContent.className = 'project-overlay-content';

  const overlayCta = document.createElement('span');
  overlayCta.className = 'project-overlay-cta';
  overlayCta.textContent = translate('project.card.cta', 'View project');

  overlayContent.append(overlayCta);
  overlay.append(overlayContent);
  media.append(overlay);

  const body = document.createElement('div');
  body.className = 'card-body';

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = [location, year, type].filter(Boolean).join(' · ');

  const summaryEl = document.createElement('p');
  summaryEl.textContent = summary || '';

  body.append(titleEl, meta, summaryEl);
  link.append(media, body);
  return link;
}

function createFeaturedProjectCard(project, lang = getCurrentLang()) {
  const { slug, year, coverImage, href } = project;
  const title = tField(project.title, lang);
  const location = getLocationLabel(project, lang);
  const type = getCategoryLabel(project, lang);
  const summary = getProjectSummary(project, lang);
  const link = document.createElement('a');
  link.className = 'project-card project-card--featured project-card--featured-main';
  link.href = href || `${ROOT_PATH}/projects/${slug}/`;
  const media = document.createElement('div');
  media.className = 'project-media';
  if (coverImage) {
    const img = document.createElement('img');
    img.alt = title || 'Proyecto';
    img.src = resolveAsset(coverImage, `${ROOT_PATH}/img/${slug}/preview.jpg`);
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 1280;
    img.height = 720;
    img.addEventListener('error', () => {
      img.remove();
      if (!media.querySelector('.img-fallback')) media.prepend(createMediaFallback());
    });
    media.append(img);
  } else {
    media.append(createMediaFallback());
  }

  const body = document.createElement('div');
  body.className = 'card-body';
  const titleEl = document.createElement('h3');
  titleEl.textContent = title || translate('project.card.titleFallback', 'Project');
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = [type, location, year].filter(Boolean).join(' · ');
  const cta = document.createElement('span');
  cta.className = 'project-overlay-cta';
  cta.textContent = translate('project.card.cta', 'View project');
  body.append(titleEl, meta, cta);
  link.append(media, body);

  return link;
}

function createFeaturedShowcase(project, lang = getCurrentLang()) {
  const { slug, year, coverImage, href } = project;
  const title = tField(project.title, lang) || translate('project.card.titleFallback', 'Project');
  const location = getLocationLabel(project, lang);
  const type = getCategoryLabel(project, lang);
  const summary = tField(project.shortDescription, lang) || tField(project.summary, lang);
  const link = href || `${ROOT_PATH}/projects/${slug}/`;

  const showcase = document.createElement('article');
  showcase.className = 'featured-showcase';
  showcase.setAttribute('data-featured-slug', slug || '');

  const mediaLink = document.createElement('a');
  mediaLink.className = 'featured-showcase__media';
  mediaLink.href = link;
  mediaLink.setAttribute('aria-label', `${translate('project.card.cta', 'View project')}: ${title}`);

  if (coverImage) {
    const img = document.createElement('img');
    img.alt = title;
    img.src = resolveAsset(coverImage, `${ROOT_PATH}/img/${slug}/preview.jpg`);
    img.loading = 'eager';
    img.decoding = 'async';
    img.width = 1280;
    img.height = 800;
    img.addEventListener('error', () => {
      img.remove();
      if (!mediaLink.querySelector('.img-fallback')) mediaLink.prepend(createMediaFallback());
    });
    mediaLink.append(img);
  } else {
    mediaLink.append(createMediaFallback());
  }

  const introOverlay = document.createElement('div');
  introOverlay.className = 'featured-showcase__intro';
  introOverlay.innerHTML = `
    <h3>${translate('featured.title', 'Selected Works')}</h3>
    <p>${translate('featured.lead', 'A curated view of residential, commercial, interior and conceptual projects shaped through design, BIM intelligence and construction logic.')}</p>
    <a class="btn btn-ghost featured-showcase__intro-cta" href="${ROOT_PATH}/projects.html">${translate('featured.viewAll', 'View all projects')}</a>
  `;

  const mediaOverlay = document.createElement('div');
  mediaOverlay.className = 'featured-showcase__media-overlay';
  mediaOverlay.innerHTML = `
    <span class="featured-showcase__eyebrow">${type || ''}</span>
    <h4>${title}</h4>
    <p class="featured-showcase__meta">${[location, year, type].filter(Boolean).join(' · ')}</p>
    <p class="featured-showcase__summary">${summary || ''}</p>
    <a class="btn btn-ghost featured-showcase__cta" href="${link}">${translate('project.card.cta', 'View project')}</a>
  `;
  mediaLink.append(introOverlay, mediaOverlay);
  showcase.append(mediaLink);
  return showcase;
}

function createProjectSelectorCard(project, index, lang = getCurrentLang()) {
  const { slug, year, coverImage } = project;
  const title = tField(project.title, lang) || translate('project.card.titleFallback', 'Project');
  const locationRaw = getLocationLabel(project, lang);
  const location = (locationRaw || '').split(',')[0].trim();
  const type = getCategoryLabel(project, lang);
  const summary = getProjectSummary(project, lang) || '';
  const compactSummary = summary.replace(/\s+/g, ' ').trim();
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'project-selector-card';
  button.dataset.slug = slug || '';
  button.setAttribute('aria-label', `${title} · ${[location, year, type].filter(Boolean).join(' · ')}`);
  button.innerHTML = `
    <span class="project-selector-card__inner">
      <span class="project-selector-card__face project-selector-card__face--front">
        <span class="project-selector-card__media"></span>
        <span class="project-selector-card__content">
          <strong>${title}</strong>
          <span class="project-selector-card__meta">${[location, year].filter(Boolean).join(' · ')}</span>
          <span class="project-selector-card__summary">${compactSummary}</span>
          <span class="project-selector-card__cta">${translate('project.card.cta', 'View project')}</span>
        </span>
      </span>
    </span>
  `;
  const media = button.querySelector('.project-selector-card__media');
  if (coverImage && media) {
    const img = document.createElement('img');
    img.alt = '';
    img.src = resolveAsset(coverImage, `${ROOT_PATH}/img/${slug}/preview.jpg`);
    img.loading = index < 3 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.width = 480;
    img.height = 320;
    img.addEventListener('error', () => img.remove());
    media.append(img);
  }
  return button;
}

function renderFeaturedSkeleton(container, count) {
  container.innerHTML = '';
  const page = document.createElement('div');
  page.className = 'featured-page';
  for (let i = 0; i < count; i += 1) {
    const skeleton = document.createElement('div');
    skeleton.className = 'featured-skeleton';
    page.appendChild(skeleton);
  }
  container.appendChild(page);
}

function getFeaturedProjects(projects) {
  const featured = projects.filter((project) => project.featured === true);
  const nonFeatured = projects.filter((project) => project.featured !== true);
  return featured.length ? [...featured, ...nonFeatured] : projects;
}

export async function initFeaturedGallery(options = {}) {
  const {
    container = document.getElementById('featured-projects'),
    totalVisible = 4,
  } = options;

  if (!container) return;
  renderFeaturedSkeleton(container, totalVisible);

  let projects = [];
  try {
    projects = await loadProjectsData();
  } catch (error) {
    console.error(`No se pudieron cargar los proyectos destacados desde ${PROJECT_INDEX_PATH}`, error);
  }

  const lang = getCurrentLang();
  const featuredProjects = getFeaturedProjects(projects).slice(0, 16);
  if (!featuredProjects.length) {
    container.innerHTML = `<p>${translate('featured.empty', 'No projects available.')}</p>`;
    return;
  }
  const curated = featuredProjects.slice(0, 8);
  const [featuredProject] = curated;
  container.innerHTML = '';
  container.classList.add('featured-layout');
  const map = new Map(curated.map((p) => [p.slug, p]));
  let activeSlug = featuredProject.slug;
  const showcaseWrap = document.createElement('div');
  showcaseWrap.className = 'featured-showcase-wrap';
  const renderShowcase = (slug) => {
    const project = map.get(slug);
    if (!project) return;
    const next = createFeaturedShowcase(project, getCurrentLang());
    next.classList.add('is-entering');
    showcaseWrap.innerHTML = '';
    showcaseWrap.append(next);
    requestAnimationFrame(() => next.classList.remove('is-entering'));
  };
  renderShowcase(activeSlug);

  const rail = document.createElement('aside');
  rail.className = 'featured-rail';
  rail.setAttribute('aria-label', translate('featured.title', 'Selected Works'));
  const railTop = document.createElement('div');
  railTop.className = 'featured-rail__top';
  const railCount = document.createElement('span');
  railCount.className = 'featured-rail__count';
  const prev = document.createElement('button');
  prev.className = 'featured-rail__arrow';
  prev.type = 'button';
  prev.setAttribute('aria-label', translate('featured.prev', 'Previous'));
  prev.textContent = '‹';
  const nextBtn = document.createElement('button');
  nextBtn.className = 'featured-rail__arrow';
  nextBtn.type = 'button';
  nextBtn.setAttribute('aria-label', translate('featured.next', 'Next'));
  nextBtn.textContent = '›';
  const updateCount = () => {
    const idx = curated.findIndex((p) => p.slug === activeSlug);
    railCount.textContent = `${String(idx + 1).padStart(2, '0')}/${String(curated.length).padStart(2, '0')}`;
  };
  railTop.append(railCount, prev, nextBtn);
  const secondaryGrid = document.createElement('div');
  secondaryGrid.className = 'featured-secondary-grid';
  curated.forEach((project, index) => {
    const selector = createProjectSelectorCard(project, index, lang);
    if (project.slug === activeSlug) selector.classList.add('is-active');
    selector.addEventListener('click', () => {
      activeSlug = project.slug;
      secondaryGrid.querySelectorAll('.project-selector-card').forEach((item) => item.classList.remove('is-active'));
      selector.classList.add('is-active');
      renderShowcase(activeSlug);
      updateCount();
    });
    selector.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') selector.click();
    });
    secondaryGrid.append(selector);
  });
  prev.addEventListener('click', () => {
    const idx = curated.findIndex((p) => p.slug === activeSlug);
    const nextIndex = (idx - 1 + curated.length) % curated.length;
    secondaryGrid.querySelectorAll('.project-selector-card')[nextIndex]?.click();
  });
  nextBtn.addEventListener('click', () => {
    const idx = curated.findIndex((p) => p.slug === activeSlug);
    const nextIndex = (idx + 1) % curated.length;
    secondaryGrid.querySelectorAll('.project-selector-card')[nextIndex]?.click();
  });
  updateCount();
  rail.append(railTop, secondaryGrid);
  container.append(showcaseWrap, rail);
}

export async function renderFeaturedProjects(limit = 4) {
  await initFeaturedGallery({ totalVisible: limit });
}

export function filterProjects(projects, criteria, lang = getCurrentLang()) {
  const query = (criteria.search || '').toLowerCase().trim();
  return projects.filter((project) => {
    const projectTypeKey = getCategoryKey(project);
    const projectLocationKey = getLocationKey(project);
    const matchesType = criteria.type ? projectTypeKey === criteria.type : true;
    const matchesLocation = criteria.location ? projectLocationKey === criteria.location : true;

    const searchableFields = [
      tField(project.title, lang),
      getProjectSummary(project, lang),
      getLocationLabel(project, lang),
      getCategoryLabel(project, lang),
    ];

    const matchesQuery = query
      ? searchableFields
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query))
      : true;

    return matchesType && matchesLocation && matchesQuery;
  });
}

export function renderProjects(container, projects, lang = getCurrentLang()) {
  if (!container) return;
  container.innerHTML = '';
  if (!projects.length) {
    container.innerHTML = `<p>${translate('projects.empty', 'No projects found.')}</p>`;
    return;
  }
  projects.forEach((project) => container.appendChild(createProjectCard(project, lang)));
}

export function populateFilterOptions(projects, lang = getCurrentLang(), state = {}) {
  const typeSelect = document.getElementById('filter-type');
  const locationSelect = document.getElementById('filter-location');
  if (!typeSelect || !locationSelect) return;

  const categories = new Map();
  const locations = new Map();

  projects.forEach((project) => {
    const categoryKey = getCategoryKey(project);
    const categoryLabel = getCategoryLabel(project, lang);
    if (categoryKey && categoryLabel && !categories.has(categoryKey)) {
      categories.set(categoryKey, categoryLabel);
    }

    const locationKey = getLocationKey(project);
    const locationLabel = getLocationLabel(project, lang);
    if (locationKey && locationLabel && !locations.has(locationKey)) {
      locations.set(locationKey, locationLabel);
    }
  });

  const addOptions = (select, values, selectedValue = '') => {
    const allLabel = translate('projects.filters.all', 'All');
    const options = [`<option value="">${allLabel}</option>`];
    [...values.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .forEach(([value, label]) => {
        options.push(`<option value="${value}">${label}</option>`);
      });
    select.innerHTML = options.join('');
    select.value = selectedValue || '';
  };

  addOptions(typeSelect, categories, state.type || typeSelect.value);
  addOptions(locationSelect, locations, state.location || locationSelect.value);
}

function setHero(data) {
  const titleEl = document.querySelector('.project-hero h1');
  const cardTitle = document.querySelector('.project-hero__card-title');
  const metaContainer = document.querySelector('.project-hero .project-meta');
  const summaryEl = document.querySelector('.project-hero .summary');
  const bulletsEl = document.querySelector('.project-hero__bullets');
  const hotspotsEl = document.querySelector('.project-hero__hotspots');
  const heroImage = document.querySelector('.hero-visual img');
  const heroPlaceholder = document.querySelector('.hero-visual .placeholder');
  const lang = getCurrentLang();
  const title = tField(data.title, lang) || 'Project';

  if (titleEl) titleEl.textContent = title;
  if (cardTitle) cardTitle.textContent = title;

  if (metaContainer) {
    metaContainer.innerHTML = '';
    [getLocationLabel(data, lang), data.year, getCategoryLabel(data, lang)]
      .filter(Boolean)
      .forEach((label) => {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = label;
        metaContainer.appendChild(span);
      });
  }

  if (summaryEl) {
    summaryEl.textContent = getProjectSummary(data, lang);
  }

  if (bulletsEl) {
    const defaults = [
      translate('project.detail.bullet1', 'Contemporary architectural language'),
      translate('project.detail.bullet2', 'Programmatic clarity and circulation'),
      translate('project.detail.bullet3', 'BIM-driven documentation'),
      translate('project.detail.bullet4', 'Atmosphere, light and material precision'),
    ];
    const source = Array.isArray(data.technicalBullets) && data.technicalBullets.length ? data.technicalBullets : defaults;
    bulletsEl.innerHTML = '';
    source.slice(0, 5).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = tField(item, lang) || item;
      bulletsEl.appendChild(li);
    });
  }

  if (hotspotsEl) {
    const labels = [
      translate('project.detail.hotspotConcept', 'Concept'),
      translate('project.detail.hotspotMateriality', 'Materiality'),
      translate('project.detail.hotspotProgram', 'Program'),
      translate('project.detail.hotspotBim', 'BIM process'),
      translate('project.detail.gallery', 'Gallery'),
    ];
    const imgs = (data.images || []).slice(0, 5);
    hotspotsEl.innerHTML = '';
    labels.forEach((label, i) => {
      const btn = document.createElement('a');
      btn.className = 'project-hotspot';
      btn.href = i === 4 ? '#project-gallery' : '#project-description';
      const image = imgs[i] ? resolveAsset(imgs[i], '') : (data.coverImage ? resolveAsset(data.coverImage, '') : '');
      btn.innerHTML = `<span class="project-hotspot__thumb"${image ? ` style="background-image:url('${image}')"` : ''}></span><span>${label}</span>`;
      hotspotsEl.appendChild(btn);
    });
  }

  if (heroImage && data.coverImage) {
    heroImage.src = resolveAsset(data.coverImage, '');
    heroImage.alt = tField(data.title, lang) || 'Project hero image';
    heroImage.hidden = false;
    if (heroPlaceholder) heroPlaceholder.hidden = true;
  }
}

function initCasaLomasExplorer(data) {
  if (document.body.dataset.project !== 'casa-lomas') return;
  const hero = document.querySelector('.project-hero--immersive .hero-visual');
  const heroImage = hero?.querySelector('img');
  const hotspotsWrap = hero?.querySelector('.project-hero__hotspots');
  if (!hero || !heroImage || !hotspotsWrap) return;
  const lang = getCurrentLang();
  const nodes = [
    { key: 'concept', label: translate('project.detail.hotspotConcept', 'Concept'), image: 'projects/casa-lomas/img/Vista%20princ2.jpg', text: translate('project.detail.conceptBody', 'Contemporary spatial composition with volumetric clarity and controlled natural light.') },
    { key: 'bim', label: translate('project.detail.hotspotBim', 'BIM process'), image: 'projects/casa-lomas/img/XMPL1.png', text: translate('project.detail.bimBody', 'Coordinated BIM model to align design intent, documentation and constructability.') },
    { key: 'materiality', label: translate('project.detail.hotspotMateriality', 'Materiality'), image: 'projects/casa-lomas/img/CALOM5.jpg', text: translate('project.detail.materialityBody', 'Muted materials and robust textures calibrated for warmth, durability and contrast.') },
    { key: 'program', label: translate('project.detail.hotspotProgram', 'Program'), image: 'projects/casa-lomas/img/CALOM2.jpg', text: translate('project.detail.programBody', 'Social core, double-height living spaces and clear vertical circulation hierarchy.') },
    { key: 'gallery', label: translate('project.detail.gallery', 'Gallery'), image: 'projects/casa-lomas/img/Miradorlomas01.jpg', text: translate('project.detail.galleryBody', 'A sequence of interior and exterior moments composed as an architectural narrative.') },
  ];
  const resolved = nodes.map((n) => ({ ...n, src: resolveAsset(n.image, heroImage.src) }));
  let active = 0;
  hotspotsWrap.innerHTML = '';
  const topbar = document.createElement('div');
  topbar.className = 'explorer-topbar';
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.textContent = '‹';
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.textContent = '›';
  topbar.append(closeBtn, prevBtn, nextBtn);
  const modal = document.createElement('article');
  modal.className = 'explorer-modal';
  const dots = document.createElement('div');
  dots.className = 'explorer-dots';
  const setActive = (idx) => {
    active = (idx + resolved.length) % resolved.length;
    const item = resolved[active];
    heroImage.src = item.src;
    modal.innerHTML = `<h4>${item.label}</h4><p>${item.text}</p>`;
    dots.querySelectorAll('button').forEach((d, i) => d.classList.toggle('is-active', i === active));
    hotspotsWrap.querySelectorAll('.project-hotspot').forEach((h, i) => h.classList.toggle('is-active', i === active));
    hero.classList.add('is-exploring');
  };
  resolved.forEach((n, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `project-hotspot project-hotspot--${n.key}`;
    btn.innerHTML = `<span class="project-hotspot__thumb" style="background-image:url('${n.src}')"></span><span>${n.label}</span>`;
    btn.addEventListener('click', () => setActive(i));
    hotspotsWrap.append(btn);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.addEventListener('click', () => setActive(i));
    dots.append(dot);
  });
  prevBtn.addEventListener('click', () => setActive(active - 1));
  nextBtn.addEventListener('click', () => setActive(active + 1));
  closeBtn.addEventListener('click', () => hero.classList.remove('is-exploring'));
  hero.append(topbar, modal, dots);
  setActive(0);
}

function renderDescriptionFromMarkdown(md) {
  const container = document.querySelector('.project-description .content');
  if (!container) return;

  const galleryIndex = md.search(/^##\s+(Galería|Gallery|Galerie)\b/im);
  const descriptionMd = galleryIndex !== -1 ? md.slice(0, galleryIndex) : md;
  const sanitized = descriptionMd.replace(/^#.+$/m, '').trim();
  container.innerHTML = markdownToHtml(sanitized);
}

async function renderGallery(slug, md, data) {
  const container = document.querySelector('.project-gallery .grid');
  if (!container) return;

  container.innerHTML = '';
  let images = extractGalleryImages(md)
    .map((img) => ({ ...img, src: img.src.startsWith('img/') ? `${ROOT_PATH}/projects/${slug}/${img.src}` : img.src }));

  const verified = [];
  for (const image of images) {
    if (await imageExists(image.src)) {
      verified.push(image);
    }
  }

  if (!verified.length) {
    images = await discoverImages(slug, data.images || []);
  } else {
    images = verified;
  }

  if (!images.length) {
    container.innerHTML = '<p>Galería pendiente de actualización.</p>';
    return;
  }

  images.forEach(({ src, alt }) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || 'Imagen del proyecto';
    img.loading = 'lazy';
    container.appendChild(img);
  });
}

export async function renderProjectDetail(slug) {
  try {
    const lang = getCurrentLang();
    const [data, md] = await Promise.all([loadProjectData(slug, lang), loadProjectMarkdown(slug, lang)]);
    const { body } = parseFrontmatterMarkdown(md);
    setHero(data);
    initCasaLomasExplorer(data);
    renderDescriptionFromMarkdown(body);
    await renderGallery(slug, body, data);
  } catch (error) {
    console.error('No se pudo cargar el proyecto', error);
    const description = document.querySelector('.project-description .content');
    if (description) description.innerHTML = '<p>No se pudo cargar el contenido del proyecto.</p>';
  }
}

export const ProjectLoader = {
  loadProjectsData,
  initFeaturedGallery,
  renderFeaturedProjects,
  filterProjects,
  renderProjects,
  renderProjectDetail,
  populateFilterOptions,
};
