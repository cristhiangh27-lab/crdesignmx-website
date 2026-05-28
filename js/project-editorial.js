const APPLY_DELAYS = [180, 520, 1000, 1800];

function ensureProjectGalleryLightboxAssets() {
  const slug = document.body?.dataset?.project;
  if (slug !== 'casa-carmona') return;

  const root = window.__SITE_ROOT__ || (window.location.pathname.includes('/projects/') ? '../..' : '.');
  if (!document.querySelector('link[href*="project-gallery-lightbox.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${root}/css/project-gallery-lightbox.css?v=5`;
    link.dataset.projectGalleryLightbox = 'true';
    document.head.append(link);
  }

  if (!document.querySelector('script[src*="project-gallery-lightbox.js"]')) {
    import('./project-gallery-lightbox.js?v=5');
  }
}

function isProjectDetail() {
  return document.body?.classList.contains('project-page')
    && document.body?.dataset?.project
    && document.body.dataset.project !== 'casa-lomas';
}

function t(key, fallback) {
  return window.__i18n?.dict?.[key] || fallback;
}

function make(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function clear(node) {
  if (node) node.replaceChildren();
}

function normalizeKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function plainText(node) {
  return (node?.textContent || '').trim().replace(/\s+/g, ' ');
}

function isUsableImageSrc(src = '') {
  try {
    const { pathname } = new URL(src, window.location.href);
    return /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(decodeURIComponent(pathname));
  } catch (error) {
    return false;
  }
}

function uniqueImages(images) {
  const seen = new Set();
  return images.filter((image) => {
    if (!image.src || !isUsableImageSrc(image.src) || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}

function getProjectImages() {
  const galleryImages = Array.from(document.querySelectorAll('#project-gallery .grid img, #project-gallery .project-gallery__thumb img'))
    .map((img) => ({ src: img.currentSrc || img.src, alt: img.alt || '' }));
  const heroImage = document.querySelector('.project-hero img:not([hidden])');
  const fallback = heroImage ? [{ src: heroImage.currentSrc || heroImage.src, alt: heroImage.alt || plainText(document.querySelector('h1')) }] : [];
  return uniqueImages([...galleryImages, ...fallback]);
}

function getDescriptionSections() {
  const body = document.querySelector('.project-description__body');
  if (!body) return [];

  const sections = [];
  Array.from(body.querySelectorAll('h2')).forEach((heading) => {
    const title = plainText(heading);
    if (!title || normalizeKey(title).includes('galer')) return;

    const nodes = [];
    let cursor = heading.nextElementSibling;
    while (cursor && cursor.tagName.toLowerCase() !== 'h2') {
      nodes.push(cursor);
      cursor = cursor.nextElementSibling;
    }

    const paragraphs = nodes
      .filter((node) => node.tagName.toLowerCase() === 'p')
      .map(plainText)
      .filter(Boolean);
    const bullets = nodes
      .flatMap((node) => Array.from(node.querySelectorAll?.('li') || []))
      .map(plainText)
      .filter(Boolean)
      .slice(0, 5);

    sections.push({
      title,
      body: paragraphs.join(' ').split('. ').slice(0, 2).join('. '),
      bullets,
    });
  });

  return sections;
}

function ensureHeroActions() {
  const hero = document.querySelector('#project-hero');
  const intro = hero?.querySelector('.project-hero__intro');
  if (!hero || !intro) return;

  hero.querySelectorAll('.explorer-topbar, .explorer-modal, .explorer-dots, .project-hero__hotspots, .project-hero__card').forEach((node) => node.remove());

  let actions = intro.querySelector('.project-hero__intro-actions');
  if (!actions) {
    actions = make('div', 'project-hero__intro-actions');
    intro.append(actions);
  }

  clear(actions);
  const read = make('a', 'btn btn-primary', t('project.detail.readProject', 'Read project'));
  read.href = '#project-description';
  const gallery = make('a', 'btn btn-ghost', t('project.detail.viewGallery', 'View gallery'));
  gallery.href = '#project-gallery';
  actions.append(read, gallery);
}

function renderProjectSections(images) {
  document.querySelector('.project-sections--editorial')?.remove();

  const hero = document.querySelector('#project-hero');
  if (!hero) return;

  const h1 = plainText(document.querySelector('h1')) || 'Project';
  const summary = plainText(document.querySelector('.project-hero .summary'));
  const fallbackImage = images[0] || { src: '', alt: h1 };
  const sections = getDescriptionSections().slice(0, 4).map((section, index) => ({
    key: normalizeKey(section.title) || `section-${index + 1}`,
    label: section.title,
    body: section.body || summary,
    bullets: section.bullets.length ? section.bullets : [
      t('project.detail.bullet1', 'Contemporary architectural language'),
      t('project.detail.bullet2', 'Programmatic clarity and circulation'),
      t('project.detail.bullet3', 'BIM-driven documentation'),
    ],
    cta: t('project.detail.readProject', 'Read project'),
    href: '#project-description',
    image: (images[index] || fallbackImage).src,
  }));

  sections.push({
    key: 'gallery',
    label: t('project.detail.gallery', 'Gallery'),
    body: summary || t('project.detail.galleryBody', 'A visual sequence of the project narrative.'),
    bullets: [
      t('project.detail.galleryBullet1', 'Visual walkthrough of the project'),
      t('project.detail.galleryBullet2', 'Process and atmospheric imagery'),
      t('project.detail.galleryBullet3', 'Selected architectural details'),
    ],
    cta: t('project.detail.viewGallery', 'View gallery'),
    href: '#project-gallery',
    image: (images[1] || fallbackImage).src,
  });

  let activeIndex = 0;
  const wrapper = make('section', 'project-sections project-sections--editorial');
  wrapper.id = 'project-sections';
  wrapper.setAttribute('aria-labelledby', 'project-sections-title');

  const header = make('div', 'project-sections__header');
  header.append(
    make('p', 'section-lead', t('project.detail.sectionsKicker', 'Project sections')),
    make('h2', '', t('project.detail.sectionsTitle', 'Project sections')),
  );
  header.querySelector('h2').id = 'project-sections-title';

  const shell = make('div', 'project-sections__shell');
  const prev = make('button', 'project-sections__arrow project-sections__arrow--prev', '<');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous section');
  const next = make('button', 'project-sections__arrow project-sections__arrow--next', '>');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next section');
  const track = make('div', 'project-sections__track');
  const panel = make('div', 'project-sections__panel');

  const update = () => {
    const lastIndex = sections.length - 1;
    const prevIndex = activeIndex === 0 ? lastIndex : activeIndex - 1;
    const nextIndex = activeIndex === lastIndex ? 0 : activeIndex + 1;
    const active = sections[activeIndex];

    track.querySelectorAll('.project-section-card').forEach((card, index) => {
      const isActive = index === activeIndex;
      const isPrev = index === prevIndex;
      const isNext = index === nextIndex;
      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-side-left', isPrev);
      card.classList.toggle('is-side-right', isNext);
      card.classList.toggle('is-visible', isActive || isPrev || isNext);
      card.classList.toggle('is-hidden', !(isActive || isPrev || isNext));
      card.setAttribute('aria-pressed', String(isActive));
      card.tabIndex = isActive || isPrev || isNext ? 0 : -1;
    });

    const copy = make('div', 'project-sections__panel-copy');
    copy.append(
      make('p', 'section-lead', t('project.detail.activeLabel', 'Active section')),
      make('h3', '', active.label),
      make('p', '', active.body),
    );
    const list = make('ul');
    active.bullets.forEach((bullet) => list.append(make('li', '', bullet)));
    const link = make('a', 'btn btn-primary', active.cta);
    link.href = active.href;
    copy.append(list, link);

    const image = document.createElement('img');
    image.src = active.image;
    image.alt = active.label;
    image.loading = 'lazy';

    clear(panel);
    panel.append(copy, image);
  };

  sections.forEach((section, index) => {
    const card = make('button', `project-section-card project-hotspot--${section.key}`);
    card.type = 'button';
    card.setAttribute('aria-label', section.label);
    const media = make('span', 'project-section-card__media');
    media.style.backgroundImage = `url("${section.image}")`;
    card.append(media, make('span', '', section.label));
    card.addEventListener('click', () => {
      activeIndex = index;
      update();
    });
    track.append(card);
  });

  prev.addEventListener('click', () => {
    activeIndex = activeIndex === 0 ? sections.length - 1 : activeIndex - 1;
    update();
  });
  next.addEventListener('click', () => {
    activeIndex = (activeIndex + 1) % sections.length;
    update();
  });

  shell.append(prev, track, next);
  wrapper.append(header, shell, panel);
  hero.insertAdjacentElement('afterend', wrapper);
  update();
}

function makeDescriptionEditorial() {
  const section = document.querySelector('.project-description');
  const content = section?.querySelector('.content');
  const body = content?.querySelector('.project-description__body');
  const meta = content?.querySelector('.project-description__meta');
  if (!section || !content || !body || !meta) return;

  section.classList.add('project-description--editorial');
  if (content.firstElementChild !== body) {
    content.replaceChildren(body, meta);
  }
}

function renderShowcaseGallery(images) {
  const section = document.querySelector('.project-gallery');
  const grid = section?.querySelector('.grid');
  if (!section || !grid || !images.length) return;

  section.classList.add('project-gallery--showcase');
  grid.className = 'grid project-gallery__showcase';
  clear(grid);

  const h1 = plainText(document.querySelector('h1')) || 'Project';
  const visibleImages = images.slice(0, 10);
  const totalLabel = String(visibleImages.length).padStart(2, '0');
  const feature = make('figure', 'project-gallery__feature');
  const featureImage = document.createElement('img');
  featureImage.src = visibleImages[0].src;
  featureImage.alt = visibleImages[0].alt || h1;
  featureImage.loading = 'eager';

  const caption = make('figcaption', 'project-gallery__caption');
  caption.append(
    make('p', 'section-lead', t('project.detail.visualSequence', 'Visual sequence')),
    make('h3', '', `${h1} ${t('project.detail.galleryFrames', 'in frames')}`),
    make('span', '', `01 / ${totalLabel}`),
  );
  feature.append(featureImage, caption);

  const thumbs = make('div', 'project-gallery__thumbs');
  thumbs.setAttribute('aria-label', t('project.detail.galleryHint', 'Select a frame'));
  visibleImages.forEach((item, index) => {
    const thumb = make('button', 'project-gallery__thumb');
    thumb.type = 'button';
    thumb.setAttribute('aria-label', `${t('project.detail.galleryHint', 'Select a frame')} ${index + 1}`);
    const thumbImage = document.createElement('img');
    thumbImage.src = item.src;
    thumbImage.alt = item.alt || h1;
    thumbImage.loading = 'lazy';
    thumb.append(thumbImage, make('span', '', String(index + 1).padStart(2, '0')));
    thumb.addEventListener('click', () => {
      featureImage.src = item.src;
      featureImage.alt = item.alt || h1;
      caption.querySelector('span').textContent = `${String(index + 1).padStart(2, '0')} / ${totalLabel}`;
      thumbs.querySelectorAll('.project-gallery__thumb').forEach((button) => button.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
    if (index === 0) thumb.classList.add('is-active');
    thumbs.append(thumb);
  });

  grid.append(feature, thumbs);
}

function readyToApply() {
  return !!document.querySelector('.project-hero h1')?.textContent?.trim()
    && !!document.querySelector('.project-description__body')
    && !!document.querySelector('#project-gallery .grid');
}

function applyProjectEditorial() {
  if (!isProjectDetail() || !readyToApply()) return;

  document.body.classList.add('project-editorial-ready');
  const images = getProjectImages();
  ensureHeroActions();
  makeDescriptionEditorial();
  renderProjectSections(images);
  renderShowcaseGallery(images);
  ensureProjectGalleryLightboxAssets();
}

function scheduleEditorialApply() {
  APPLY_DELAYS.forEach((delay) => window.setTimeout(applyProjectEditorial, delay));
}

window.ProjectEditorial = { apply: applyProjectEditorial };
window.addEventListener('DOMContentLoaded', scheduleEditorialApply);
window.addEventListener('load', scheduleEditorialApply);
window.addEventListener('langchange', scheduleEditorialApply);
scheduleEditorialApply();
