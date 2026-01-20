const ROOT_PATH = window.location.pathname.includes('/projects/') && !window.location.pathname.endsWith('/projects.html')
  ? '../..'
  : '.';

const PROJECT_INDEX_PATH = `${ROOT_PATH}/projects/projects.json`;

function resolveAsset(path, fallback) {
  if (!path) return fallback;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${ROOT_PATH}${path}`;
  return `${ROOT_PATH}/${path}`;
}

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path} (${response.status})`);
  }
  return response.json();
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path} (${response.status})`);
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
    console.error('No se pudo cargar el índice de proyectos', error);
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
  label.textContent = 'Proyecto';

  fallback.append(label);
  return fallback;
}

function createProjectCard(project) {
  const { slug, title, location, year, type, summary, coverImage, href } = project;
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
  overlayCta.textContent = 'Ver proyecto';

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

function createFeaturedProjectCard(project) {
  const { slug, title, location, year, type, summary, coverImage, href } = project;
  const link = document.createElement('a');
  link.className = 'project-card flip-card project-card--featured';
  link.href = href || `${ROOT_PATH}/projects/${slug}/`;

  const resolvedCover = coverImage ? resolveAsset(coverImage, `${ROOT_PATH}/img/${slug}/preview.jpg`) : '';

  const inner = document.createElement('div');
  inner.className = 'flip-inner';

  const front = document.createElement('div');
  front.className = 'flip-face flip-front';

  if (!resolvedCover) {
    front.append(createMediaFallback());
  }

  const back = document.createElement('div');
  back.className = 'flip-face flip-back';

  if (resolvedCover) {
    const absoluteCover = new URL(resolvedCover, window.location.href).href;
    link.style.setProperty('--card-img', `url("${absoluteCover}")`);
    const preload = new Image();
    preload.src = absoluteCover;
    preload.addEventListener('error', () => {
      link.classList.add('flip-card--fallback');
      link.style.removeProperty('--card-img');
      if (!front.querySelector('.img-fallback')) {
        front.append(createMediaFallback());
      }
      if (!back.querySelector('.img-fallback')) {
        back.append(createMediaFallback());
      }
    });
  } else {
    link.classList.add('flip-card--fallback');
  }

  const backContent = document.createElement('div');
  backContent.className = 'flip-content';

  const backTitle = document.createElement('h3');
  backTitle.textContent = title || 'Proyecto';

  const backCta = document.createElement('span');
  backCta.className = 'flip-cta';
  backCta.textContent = 'Ver proyecto';

  backContent.append(backTitle, backCta);
  back.append(backContent);
  if (!resolvedCover) {
    back.append(createMediaFallback());
  }
  inner.append(front, back);
  link.append(inner);

  return link;
}

export async function renderFeaturedProjects(limit = 3) {
  const container = document.querySelector('.carousel-track') || document.getElementById('featured-projects');
  if (!container) return;

  container.innerHTML = '';
  let projects = [];
  try {
    projects = await loadProjectsData();
  } catch (error) {
    console.error('No se pudieron cargar los proyectos destacados', error);
  }
  const featured = projects.slice(0, limit);
  const fallbackExisting = [
    {
      slug: 'casa-lomas',
      title: 'Casa Lomas',
      location: 'CDMX',
      type: 'Residencial',
      summary: 'Proyecto residencial con enfoque en documentación clara y soporte a obra.',
    },
    {
      slug: 'casa-carmona',
      title: 'Casa Carmona',
      location: 'CDMX',
      type: 'Residencial',
      summary: 'Modelado BIM coordinado y entregables consistentes.',
    },
    {
      slug: 't2-aicm',
      title: 'T2 AICM',
      location: 'CDMX',
      type: 'Infraestructura',
      summary: 'Coordinación técnica y control de entregables para obra.',
    },
  ];
  const placeholders = [
    {
      slug: 'algarin-hc',
      title: 'Algarín H&C',
      location: 'CDMX',
      type: 'Uso mixto',
      summary: 'Descripción breve del proyecto con enfoque en coordinación BIM y claridad documental.',
      href: `${ROOT_PATH}/projects.html`,
      coverImage: 'img/ALGP2.jpg',
    },
    {
      slug: 'coyoacan-retail-complex',
      title: 'Coyoacán Retail Complex',
      location: 'CDMX',
      type: 'Comercial',
      summary: 'Desarrollo comercial con visualizaciones claras y control de entregables.',
      href: `${ROOT_PATH}/projects.html`,
      coverImage: 'img/POR1.jpg',
    },
    {
      slug: 'penthouse-santa-maria',
      title: 'Penthouse Santa María',
      location: 'CDMX',
      type: 'Residencial',
      summary: 'Propuesta residencial con documentación precisa y soporte a obra.',
      href: `${ROOT_PATH}/projects.html`,
      coverImage: 'img/CLP2.jpg',
    },
    {
      slug: 'pabellon-kubito',
      title: 'Pabellón Kúbito',
      location: 'CDMX',
      type: 'Instalación efímera',
      summary: 'Instalación temporal con coordinación BIM y entregables consistentes.',
      href: `${ROOT_PATH}/projects.html`,
      coverImage: 'img/POR2.jpg',
    },
  ];
  const items = featured.length ? [...featured, ...placeholders] : [...fallbackExisting, ...placeholders];
  items.forEach((project) => {
    const card = createFeaturedProjectCard(project);
    container.appendChild(card);
  });
}

export function filterProjects(projects, criteria) {
  const query = (criteria.search || '').toLowerCase().trim();
  return projects.filter((project) => {
    const matchesType = criteria.type ? project.type === criteria.type : true;
    const matchesLocation = criteria.location ? project.location === criteria.location : true;
    const matchesQuery = query
      ? [project.title, project.summary, project.location, project.type]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query))
      : true;
    return matchesType && matchesLocation && matchesQuery;
  });
}

export function renderProjects(container, projects) {
  if (!container) return;
  container.innerHTML = '';
  if (!projects.length) {
    container.innerHTML = '<p>No hay proyectos que coincidan con el filtro.</p>';
    return;
  }
  projects.forEach((project) => container.appendChild(createProjectCard(project)));
}

function setHero(data) {
  const titleEl = document.querySelector('.project-hero h1');
  const metaContainer = document.querySelector('.project-hero .project-meta');
  const summaryEl = document.querySelector('.project-hero .summary');
  const heroImage = document.querySelector('.hero-visual img');
  const heroPlaceholder = document.querySelector('.hero-visual .placeholder');

  if (titleEl) titleEl.textContent = data.title || 'Proyecto';

  if (metaContainer) {
    metaContainer.innerHTML = '';
    [data.location, data.year, data.type]
      .filter(Boolean)
      .forEach((label) => {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = label;
        metaContainer.appendChild(span);
      });
  }

  if (summaryEl && data.summary) {
    summaryEl.textContent = data.summary;
  }

  if (heroImage && data.coverImage) {
    heroImage.src = resolveAsset(data.coverImage, '');
    heroImage.alt = data.title || 'Imagen principal';
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

export function populateFilterOptions(projects) {
  const typeSelect = document.getElementById('filter-type');
  const locationSelect = document.getElementById('filter-location');
  if (!typeSelect || !locationSelect) return;

  const types = new Set();
  const locations = new Set();
  projects.forEach((project) => {
    if (project.type) types.add(project.type);
    if (project.location) locations.add(project.location);
  });

  const addOptions = (select, values) => {
    select.innerHTML = '<option value="">Todos</option>' + [...values]
      .sort((a, b) => a.localeCompare(b))
      .map((value) => `<option value="${value}">${value}</option>`)
      .join('');
  };

  addOptions(typeSelect, types);
  addOptions(locationSelect, locations);
}

export const ProjectLoader = {
  loadProjectsData,
  renderFeaturedProjects,
  filterProjects,
  renderProjects,
  renderProjectDetail,
  populateFilterOptions,
};
