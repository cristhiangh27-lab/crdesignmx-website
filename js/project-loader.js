const ROOT_PATH = window.location.pathname.includes('/projects/') && !window.location.pathname.endsWith('/projects.html')
  ? '../..'
  : '.';

const PROJECT_INDEX_PATH = `${ROOT_PATH}/projects/projects.json`;

function translate(key, fallback) {
  return window.__i18n?.dict?.[key] || fallback;
}



function getCurrentLang() {
  return window.__i18n?.lang || document.documentElement.lang || 'en';
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

async function loadProjectMarkdown(slug) {
  return fetchText(`${ROOT_PATH}/projects/${slug}/index.md`);
}

async function loadProjectData(slug) {
  const data = await fetchJSON(`${ROOT_PATH}/projects/${slug}/data.json`);
  return { ...data, slug };
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

export async function loadProjectsData() {
  const entries = await loadProjectIndex();
  const projects = [];
  for (const entry of entries) {
    const slug = entry.slug || entry;
    try {
      const data = await loadProjectData(slug);
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
  const summary = tField(project.shortDescription, lang) || tField(project.summary, lang);
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

  const overlayTitle = document.createElement('p');
  overlayTitle.className = 'project-overlay-title';
  overlayTitle.textContent = title;

  const overlayMeta = document.createElement('p');
  overlayMeta.className = 'project-overlay-meta';
  overlayMeta.textContent = [location, year, type].filter(Boolean).join(' · ');

  const overlaySummary = document.createElement('p');
  overlaySummary.className = 'project-overlay-summary';
  overlaySummary.textContent = summary || '';

  const overlayCta = document.createElement('span');
  overlayCta.className = 'project-overlay-cta';
  overlayCta.textContent = translate('project.card.cta', 'View project');

  overlayContent.append(overlayTitle, overlayMeta, overlaySummary, overlayCta);
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
  const summary = tField(project.shortDescription, lang) || tField(project.summary, lang);
  const link = document.createElement('a');
  link.className = 'project-card flip-card project-card--featured project-card-featured';
  link.href = href || `${ROOT_PATH}/projects/${slug}/`;

  const resolvedCover = coverImage ? resolveAsset(coverImage, `${ROOT_PATH}/img/${slug}/preview.jpg`) : '';

  const inner = document.createElement('div');
  inner.className = 'flip-inner';

  const front = document.createElement('div');
  front.className = 'flip-face flip-front';

  const back = document.createElement('div');
  back.className = 'flip-face flip-back';

  if (resolvedCover) {
    const absoluteCover = new URL(resolvedCover, window.location.href).href;
    link.style.setProperty('--card-img', `url("${absoluteCover}")`);
    const img = document.createElement('img');
    img.src = absoluteCover;
    img.alt = title || 'Proyecto';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 640;
    img.height = 640;
    img.addEventListener('error', () => {
      img.remove();
      link.classList.add('flip-card--fallback');
      link.style.removeProperty('--card-img');
      if (!front.querySelector('.img-fallback')) {
        front.append(createMediaFallback());
      }
      if (!back.querySelector('.img-fallback')) {
        back.append(createMediaFallback());
      }
    });
    front.append(img);
  } else {
    link.classList.add('flip-card--fallback');
    front.append(createMediaFallback());
  }

  const backContent = document.createElement('div');
  backContent.className = 'flip-content';

  const backTitle = document.createElement('h3');
  backTitle.textContent = title || translate('project.card.titleFallback', 'Project');

  const backCta = document.createElement('span');
  backCta.className = 'flip-cta';
  backCta.textContent = translate('project.card.cta', 'View project');

  backContent.append(backTitle, backCta);
  back.append(backContent);
  if (!resolvedCover) {
    back.append(createMediaFallback());
  }
  inner.append(front, back);
  link.append(inner);

  return link;
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
    prevButton = document.querySelector('.carousel-btn.prev'),
    nextButton = document.querySelector('.carousel-btn.next'),
    totalVisible = 4,
  } = options;

  if (!container) return;
  renderFeaturedSkeleton(container, totalVisible);
  const viewport = container.closest('.carousel-viewport');

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
    prevButton?.setAttribute('disabled', 'disabled');
    nextButton?.setAttribute('disabled', 'disabled');
    return;
  }

  const pageSize = 4;
  let totalPages = Math.ceil(featuredProjects.length / pageSize);
  let currentPage = 0;

  const setTrackWidth = () => {
    const trackWidth = Math.max(totalPages, 1) * 100;
    container.style.width = `${trackWidth}%`;
  };

  const buildPages = () => {
    container.innerHTML = '';
    totalPages = Math.ceil(featuredProjects.length / pageSize);
    const pageWidthPct = totalPages ? 100 / totalPages : 100;
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const page = document.createElement('div');
      page.className = 'featured-page';
      page.style.flex = `0 0 ${pageWidthPct}%`;
      page.style.minWidth = `${pageWidthPct}%`;
      const startIndex = pageIndex * pageSize;
      const pageItems = featuredProjects.slice(startIndex, startIndex + pageSize);
      pageItems.forEach((project) => page.appendChild(createFeaturedProjectCard(project, lang)));
      container.appendChild(page);
    }
    setTrackWidth();
  };

  const updateTrack = () => {
    const pageEl = container.querySelector('.featured-page');
    const pageWidth = pageEl
      ? pageEl.getBoundingClientRect().width
      : container.clientWidth;
    container.style.transform = `translate3d(${-currentPage * pageWidth}px, 0, 0)`;
  };

  // Circular carousel: move between pages and wrap at the ends.
  const goToPage = (nextPage) => {
    if (totalPages === 0) return;
    currentPage = (nextPage + totalPages) % totalPages;
    updateTrack();
  };

  const handlePrev = () => goToPage(currentPage - 1);
  const handleNext = () => goToPage(currentPage + 1);

  prevButton?.addEventListener('click', handlePrev);
  nextButton?.addEventListener('click', handleNext);

  buildPages();
  updateTrack();

  window.addEventListener('resize', () => {
    totalPages = Math.ceil(featuredProjects.length / pageSize);
    currentPage = Math.min(currentPage, Math.max(totalPages - 1, 0));
    buildPages();
    updateTrack();
  });
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
      tField(project.shortDescription, lang) || tField(project.summary, lang),
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
  const metaContainer = document.querySelector('.project-hero .project-meta');
  const summaryEl = document.querySelector('.project-hero .summary');
  const heroImage = document.querySelector('.hero-visual img');
  const heroPlaceholder = document.querySelector('.hero-visual .placeholder');

  if (titleEl) titleEl.textContent = tField(data.title, getCurrentLang()) || 'Project';

  if (metaContainer) {
    metaContainer.innerHTML = '';
    [getLocationLabel(data, getCurrentLang()), data.year, getCategoryLabel(data, getCurrentLang())]
      .filter(Boolean)
      .forEach((label) => {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = label;
        metaContainer.appendChild(span);
      });
  }

  if (summaryEl) {
    summaryEl.textContent = tField(data.shortDescription, getCurrentLang()) || tField(data.summary, getCurrentLang());
  }

  if (heroImage && data.coverImage) {
    heroImage.src = resolveAsset(data.coverImage, '');
    heroImage.alt = tField(data.title, getCurrentLang()) || 'Project hero image';
    heroImage.hidden = false;
    if (heroPlaceholder) heroPlaceholder.hidden = true;
  }
}

function renderDescriptionFromMarkdown(md) {
  const container = document.querySelector('.project-description .content');
  if (!container) return;

  const galleryIndex = md.search(/^##\s+Galería/m);
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
    const [data, md] = await Promise.all([loadProjectData(slug), loadProjectMarkdown(slug)]);
    setHero(data);
    renderDescriptionFromMarkdown(md);
    await renderGallery(slug, md, data);
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
