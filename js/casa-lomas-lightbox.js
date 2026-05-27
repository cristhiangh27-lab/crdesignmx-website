const LIGHTBOX_PROJECT = 'casa-lomas';

const CASA_LOMAS_LIGHTBOX_IMAGES = [
  {
    src: 'projects/casa-lomas/img/Vista%20princ2.jpg',
    caption: {
      en: 'Facade and brick screen',
      es: 'Fachada y celosia de ladrillo',
      de: 'Fassade und Ziegelschirm',
    },
  },
  {
    src: 'projects/casa-lomas/img/Miradorlomas01.jpg',
    caption: {
      en: 'Exterior stair and evening light',
      es: 'Escalera exterior y luz de tarde',
      de: 'Aussentreppe und Abendlicht',
    },
  },
  {
    src: 'projects/casa-lomas/img/CALOM1.jpg',
    caption: {
      en: 'Interior stair sequence',
      es: 'Secuencia de escalera interior',
      de: 'Sequenz der Innentreppe',
    },
  },
  {
    src: 'projects/casa-lomas/img/CALOM2.jpg',
    caption: {
      en: 'Structure and exterior patio',
      es: 'Estructura y patio exterior',
      de: 'Struktur und Aussenhof',
    },
  },
  {
    src: 'projects/casa-lomas/img/CALOM3.jpg',
    caption: {
      en: 'Garden view',
      es: 'Vista de jardin',
      de: 'Gartenblick',
    },
  },
  {
    src: 'projects/casa-lomas/img/CALOM4.jpg',
    caption: {
      en: 'Roof and brick detail',
      es: 'Detalle de cubierta y ladrillo',
      de: 'Dach- und Ziegeldetail',
    },
  },
  {
    src: 'projects/casa-lomas/img/CALOM5.jpg',
    caption: {
      en: 'Interior frame toward the exterior',
      es: 'Encuadre interior hacia el exterior',
      de: 'Innenrahmung zum Aussenraum',
    },
  },
  {
    src: 'projects/casa-lomas/img/CALOM6.jpg',
    caption: {
      en: 'Upper volume and sky',
      es: 'Volumen superior y cielo',
      de: 'Oberes Volumen und Himmel',
    },
  },
];

const CASA_LOMAS_LIGHTBOX_COPY = {
  en: {
    open: 'View image',
    close: 'Close image viewer',
    previous: 'Previous image',
    next: 'Next image',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    rights: 'Project image. All rights reserved by CR Collective.',
  },
  es: {
    open: 'Ver imagen',
    close: 'Cerrar visor',
    previous: 'Imagen anterior',
    next: 'Imagen siguiente',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    resetZoom: 'Restablecer zoom',
    rights: 'Imagen del proyecto. Todos los derechos reservados por CR Collective.',
  },
  de: {
    open: 'Bild ansehen',
    close: 'Bildansicht schliessen',
    previous: 'Vorheriges Bild',
    next: 'Naechstes Bild',
    zoomIn: 'Vergroessern',
    zoomOut: 'Verkleinern',
    resetZoom: 'Zoom zuruecksetzen',
    rights: 'Projektbild. Alle Rechte vorbehalten durch CR Collective.',
  },
};

const lightboxState = {
  index: 0,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  startX: 0,
  startY: 0,
  lastFocus: null,
};

let lightboxDialog;
let galleryObserver;
let enhanceTimer;

function getLightboxLang() {
  const lang = window.__i18n?.lang || localStorage.getItem('lang') || document.documentElement.lang || 'en';
  return CASA_LOMAS_LIGHTBOX_COPY[lang] ? lang : 'en';
}

function getRootPath() {
  if (window.__SITE_ROOT__) return window.__SITE_ROOT__;
  const { pathname } = window.location;
  return pathname.includes('/projects/') && !pathname.endsWith('/projects.html') ? '../..' : '.';
}

function projectAsset(path) {
  return new URL(`${getRootPath()}/${path}`, window.location.href).toString();
}

function imageKey(url) {
  try {
    const pathname = new URL(url, window.location.href).pathname;
    return decodeURIComponent(pathname.split('/').pop() || '').toLowerCase();
  } catch (error) {
    return String(url).split('/').pop().toLowerCase();
  }
}

function findImageIndex(src) {
  const key = imageKey(src);
  const index = CASA_LOMAS_LIGHTBOX_IMAGES.findIndex((item) => imageKey(item.src) === key);
  return index >= 0 ? index : 0;
}

function copy() {
  return CASA_LOMAS_LIGHTBOX_COPY[getLightboxLang()];
}

function imageCaption(index) {
  const lang = getLightboxLang();
  return CASA_LOMAS_LIGHTBOX_IMAGES[index]?.caption[lang] || CASA_LOMAS_LIGHTBOX_IMAGES[index]?.caption.en || '';
}

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function updateTriggerText() {
  const labels = copy();
  document.querySelectorAll('.cr-lightbox-trigger').forEach((button) => {
    button.setAttribute('aria-label', labels.open);
    const text = button.querySelector('.cr-lightbox-trigger__text');
    if (text) text.textContent = labels.open;
  });
}

function updateDialogLabels() {
  if (!lightboxDialog) return;
  const labels = copy();
  lightboxDialog.setAttribute('aria-label', labels.open);
  lightboxDialog.querySelector('.cr-lightbox__close')?.setAttribute('aria-label', labels.close);
  lightboxDialog.querySelector('[data-lightbox-prev]')?.setAttribute('aria-label', labels.previous);
  lightboxDialog.querySelector('[data-lightbox-next]')?.setAttribute('aria-label', labels.next);
  lightboxDialog.querySelector('[data-zoom-out]')?.setAttribute('aria-label', labels.zoomOut);
  lightboxDialog.querySelector('[data-zoom-in]')?.setAttribute('aria-label', labels.zoomIn);
  lightboxDialog.querySelector('[data-zoom-reset]')?.setAttribute('aria-label', labels.resetZoom);
}

function applyImageTransform() {
  if (!lightboxDialog) return;
  const image = lightboxDialog.querySelector('.cr-lightbox__image');
  const stage = lightboxDialog.querySelector('.cr-lightbox__stage');
  const reset = lightboxDialog.querySelector('[data-zoom-reset]');
  if (!image || !stage) return;

  image.style.transform = `translate3d(${lightboxState.offsetX}px, ${lightboxState.offsetY}px, 0) scale(${lightboxState.zoom})`;
  stage.classList.toggle('is-zoomed', lightboxState.zoom > 1);
  if (reset) reset.textContent = `${Math.round(lightboxState.zoom * 100)}%`;
}

function resetZoom() {
  lightboxState.zoom = 1;
  lightboxState.offsetX = 0;
  lightboxState.offsetY = 0;
  applyImageTransform();
}

function setZoom(nextZoom) {
  const boundedZoom = Math.min(3, Math.max(1, Number(nextZoom.toFixed(2))));
  lightboxState.zoom = boundedZoom;
  if (boundedZoom === 1) {
    lightboxState.offsetX = 0;
    lightboxState.offsetY = 0;
  }
  applyImageTransform();
}

function updateDialogImage() {
  if (!lightboxDialog) return;

  const imageData = CASA_LOMAS_LIGHTBOX_IMAGES[lightboxState.index];
  const image = lightboxDialog.querySelector('.cr-lightbox__image');
  const title = lightboxDialog.querySelector('.cr-lightbox__title');
  const rights = lightboxDialog.querySelector('.cr-lightbox__rights');
  const counter = lightboxDialog.querySelector('.cr-lightbox__counter');
  const caption = imageCaption(lightboxState.index);

  if (image) {
    image.src = projectAsset(imageData.src);
    image.alt = caption;
  }
  if (title) title.textContent = `Casa Lomas - ${caption}`;
  if (rights) rights.textContent = copy().rights;
  if (counter) {
    counter.textContent = `${padNumber(lightboxState.index + 1)} / ${padNumber(CASA_LOMAS_LIGHTBOX_IMAGES.length)}`;
  }

  updateDialogLabels();
  applyImageTransform();
}

function showImage(delta) {
  const total = CASA_LOMAS_LIGHTBOX_IMAGES.length;
  lightboxState.index = (lightboxState.index + delta + total) % total;
  resetZoom();
  updateDialogImage();
}

function closeLightbox() {
  if (!lightboxDialog || lightboxDialog.hidden) return;
  lightboxDialog.classList.remove('is-open');
  document.body.classList.remove('cr-lightbox-open');
  document.removeEventListener('keydown', handleLightboxKeydown);
  window.setTimeout(() => {
    if (!lightboxDialog.classList.contains('is-open')) lightboxDialog.hidden = true;
  }, 180);

  if (lightboxState.lastFocus && typeof lightboxState.lastFocus.focus === 'function') {
    lightboxState.lastFocus.focus({ preventScroll: true });
  }
}

function openLightbox(index) {
  if (!lightboxDialog) lightboxDialog = createLightbox();
  lightboxState.index = index;
  lightboxState.lastFocus = document.activeElement;
  resetZoom();
  updateDialogImage();
  lightboxDialog.hidden = false;
  document.body.classList.add('cr-lightbox-open');
  document.addEventListener('keydown', handleLightboxKeydown);
  window.requestAnimationFrame(() => {
    lightboxDialog.classList.add('is-open');
    lightboxDialog.querySelector('.cr-lightbox__close')?.focus({ preventScroll: true });
  });
}

function handleLightboxKeydown(event) {
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showImage(-1);
  if (event.key === 'ArrowRight') showImage(1);
  if (event.key === '+' || event.key === '=') setZoom(lightboxState.zoom + 0.25);
  if (event.key === '-') setZoom(lightboxState.zoom - 0.25);
  if (event.key === '0') resetZoom();
}

function bindStagePan(stage) {
  stage.addEventListener('dblclick', () => {
    setZoom(lightboxState.zoom === 1 ? 1.8 : 1);
  });

  stage.addEventListener('pointerdown', (event) => {
    if (lightboxState.zoom <= 1) return;
    lightboxState.isDragging = true;
    lightboxState.startX = event.clientX - lightboxState.offsetX;
    lightboxState.startY = event.clientY - lightboxState.offsetY;
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener('pointermove', (event) => {
    if (!lightboxState.isDragging) return;
    lightboxState.offsetX = event.clientX - lightboxState.startX;
    lightboxState.offsetY = event.clientY - lightboxState.startY;
    applyImageTransform();
  });

  stage.addEventListener('pointerup', (event) => {
    lightboxState.isDragging = false;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  });

  stage.addEventListener('pointercancel', () => {
    lightboxState.isDragging = false;
  });
}

function createLightbox() {
  const dialog = document.createElement('div');
  dialog.className = 'cr-lightbox';
  dialog.hidden = true;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.innerHTML = `
    <div class="cr-lightbox__backdrop" data-lightbox-close></div>
    <button class="cr-lightbox__close" type="button" data-lightbox-close>
      <span aria-hidden="true">x</span>
    </button>
    <button class="cr-lightbox__nav cr-lightbox__nav--prev" type="button" data-lightbox-prev>
      <span aria-hidden="true">&lt;</span>
    </button>
    <figure class="cr-lightbox__figure">
      <div class="cr-lightbox__stage">
        <img class="cr-lightbox__image" src="" alt="" draggable="false">
        <div class="cr-lightbox__tools" aria-label="Zoom controls">
          <button type="button" data-zoom-out>-</button>
          <button type="button" data-zoom-reset>100%</button>
          <button type="button" data-zoom-in>+</button>
        </div>
      </div>
      <figcaption class="cr-lightbox__caption">
        <span class="cr-lightbox__counter"></span>
        <h3 class="cr-lightbox__title"></h3>
        <p class="cr-lightbox__rights"></p>
      </figcaption>
    </figure>
    <button class="cr-lightbox__nav cr-lightbox__nav--next" type="button" data-lightbox-next>
      <span aria-hidden="true">&gt;</span>
    </button>
  `;

  document.body.append(dialog);
  dialog.querySelectorAll('[data-lightbox-close]').forEach((button) => {
    button.addEventListener('click', closeLightbox);
  });
  dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => showImage(-1));
  dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => showImage(1));
  dialog.querySelector('[data-zoom-out]')?.addEventListener('click', () => setZoom(lightboxState.zoom - 0.25));
  dialog.querySelector('[data-zoom-in]')?.addEventListener('click', () => setZoom(lightboxState.zoom + 0.25));
  dialog.querySelector('[data-zoom-reset]')?.addEventListener('click', resetZoom);

  const stage = dialog.querySelector('.cr-lightbox__stage');
  if (stage) bindStagePan(stage);

  return dialog;
}

function createTrigger(index, mode) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `cr-lightbox-trigger cr-lightbox-trigger--${mode}`;
  button.dataset.lightboxMode = mode;
  if (Number.isInteger(index)) button.dataset.lightboxIndex = String(index);
  button.innerHTML = `
    <span class="cr-lightbox-trigger__icon" aria-hidden="true">+</span>
    <span class="cr-lightbox-trigger__text"></span>
  `;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (button.dataset.lightboxMode === 'feature') {
      const featureImage = document.querySelector('#project-gallery .project-gallery__feature img');
      openLightbox(findImageIndex(featureImage?.currentSrc || featureImage?.src || CASA_LOMAS_LIGHTBOX_IMAGES[0].src));
      return;
    }
    openLightbox(Number(button.dataset.lightboxIndex || 0));
  });
  return button;
}

function wrapThumb(thumb, index) {
  const existingShell = thumb.closest('.cr-lightbox-thumb-shell');
  if (existingShell) {
    const trigger = existingShell.querySelector('.cr-lightbox-trigger');
    if (trigger) trigger.dataset.lightboxIndex = String(index);
    return;
  }

  const shell = document.createElement('span');
  shell.className = 'cr-lightbox-thumb-shell cr-lightbox-host';
  thumb.parentNode.insertBefore(shell, thumb);
  shell.append(thumb, createTrigger(index, 'thumb'));
}

function enhanceGallery() {
  if (document.body.dataset.project !== LIGHTBOX_PROJECT) return;

  const gallery = document.querySelector('#project-gallery');
  const feature = gallery?.querySelector('.project-gallery__feature');
  const thumbs = gallery?.querySelector('.project-gallery__thumbs');
  if (!gallery || !feature || !thumbs) return;

  feature.classList.add('cr-lightbox-host', 'cr-lightbox-host--feature');
  if (![...feature.children].some((child) => child.classList?.contains('cr-lightbox-trigger'))) {
    feature.append(createTrigger(null, 'feature'));
  }

  thumbs.querySelectorAll('.project-gallery__thumb').forEach((thumb, index) => {
    const image = thumb.querySelector('img');
    wrapThumb(thumb, findImageIndex(image?.currentSrc || image?.src || CASA_LOMAS_LIGHTBOX_IMAGES[index]?.src));
  });

  updateTriggerText();
}

function scheduleEnhance(delay = 0) {
  window.clearTimeout(enhanceTimer);
  enhanceTimer = window.setTimeout(enhanceGallery, delay);
}

function observeGallery() {
  const gallery = document.querySelector('#project-gallery');
  if (!gallery || galleryObserver) return;

  galleryObserver = new MutationObserver(() => scheduleEnhance(40));
  galleryObserver.observe(gallery, { childList: true, subtree: true });
}

function initCasaLomasLightbox() {
  if (document.body.dataset.project !== LIGHTBOX_PROJECT) return;
  if (!lightboxDialog) lightboxDialog = createLightbox();
  observeGallery();
  scheduleEnhance(120);
  window.setTimeout(enhanceGallery, 450);
  window.setTimeout(enhanceGallery, 950);
}

window.addEventListener('DOMContentLoaded', initCasaLomasLightbox);
window.addEventListener('load', () => scheduleEnhance(150));
window.addEventListener('langchange', () => {
  updateTriggerText();
  updateDialogImage();
  scheduleEnhance(240);
});
