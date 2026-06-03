const BRISA_PAVILION_MODEL = 'projects/brisa-pavilion/models/brisa_pavilion_optimizado.glb?v=wood-steel-1';
const BRISA_APPLY_DELAYS = [120, 350, 850, 1400, 2300, 3400];

let placementObserver = null;
let placementFrame = 0;
let modelHashScrollDone = false;

const BRISA_PAVILION_COPY = {
  en: {
    modelAlt: 'Interactive 3D model of Brisa Pavilion',
    readProject: 'Read project',
    viewGallery: 'View gallery',
    viewModel: 'View 3D model',
    openAr: 'Open Brisa Pavilion in augmented reality',
  },
  es: {
    modelAlt: 'Modelo 3D interactivo de Brisa Pavilion',
    readProject: 'Leer proyecto',
    viewGallery: 'Ver galeria',
    viewModel: 'Ver modelo 3D',
    openAr: 'Abrir Brisa Pavilion en realidad aumentada',
  },
  de: {
    modelAlt: 'Interaktives 3D-Modell von Brisa Pavilion',
    readProject: 'Projekt lesen',
    viewGallery: 'Galerie ansehen',
    viewModel: '3D-Modell ansehen',
    openAr: 'Brisa Pavilion in Augmented Reality oeffnen',
  },
};

function getRootPath() {
  if (window.__SITE_ROOT__) return window.__SITE_ROOT__;
  const { pathname } = window.location;
  return pathname.includes('/projects/') && !pathname.endsWith('/projects.html') ? '../..' : '.';
}

function getLang() {
  const lang = window.__i18n?.lang || localStorage.getItem('lang') || document.documentElement.lang || 'en';
  return Object.prototype.hasOwnProperty.call(BRISA_PAVILION_COPY, lang) ? lang : 'en';
}

function asset(path) {
  return new URL(`${getRootPath()}/${path}`, window.location.href).toString();
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createModelViewer(copy) {
  const model = document.createElement('model-viewer');
  model.className = 'brisa-pavilion-model';
  model.setAttribute('src', asset(BRISA_PAVILION_MODEL));
  model.setAttribute('alt', copy.modelAlt);
  model.setAttribute('camera-controls', '');
  model.setAttribute('touch-action', 'pan-y');
  model.setAttribute('auto-rotate', '');
  model.setAttribute('auto-rotate-delay', '1000');
  model.setAttribute('rotation-per-second', '14deg');
  model.setAttribute('ar', '');
  model.setAttribute('ar-modes', 'scene-viewer webxr');
  model.setAttribute('shadow-intensity', '0.76');
  model.setAttribute('exposure', '1.05');
  model.setAttribute('environment-image', 'neutral');
  model.setAttribute('camera-orbit', '34deg 64deg auto');
  model.setAttribute('min-camera-orbit', 'auto 18deg auto');
  model.setAttribute('max-camera-orbit', 'auto 86deg auto');
  model.setAttribute('interaction-prompt', 'auto');

  const arButton = makeElement('button', 'brisa-pavilion-model__ar', 'AR');
  arButton.type = 'button';
  arButton.slot = 'ar-button';
  arButton.setAttribute('aria-label', copy.openAr);
  model.append(arButton);

  return model;
}

function renderModelStage(visual, copy) {
  visual.querySelector('.brisa-pavilion-model-stage')?.remove();

  const stage = makeElement('div', 'brisa-pavilion-model-stage');
  stage.setAttribute('aria-label', copy.modelAlt);
  stage.append(createModelViewer(copy));
  visual.append(stage);
}

function renderMobileModel(copy) {
  document.querySelector('.brisa-pavilion-model-mobile')?.remove();
  const hero = document.querySelector('#project-hero');
  if (!hero) return;

  const section = makeElement('section', 'brisa-pavilion-model-mobile');
  section.setAttribute('aria-label', copy.modelAlt);
  section.append(createModelViewer(copy));
  hero.insertAdjacentElement('afterend', section);
}

function placeMobileModelAfterHero() {
  const hero = document.querySelector('#project-hero');
  const mobile = document.querySelector('.brisa-pavilion-model-mobile');
  if (!hero || !mobile) return;

  if (hero.nextElementSibling !== mobile) {
    hero.insertAdjacentElement('afterend', mobile);
  }
}

function schedulePlacementSync() {
  if (placementFrame) return;
  placementFrame = window.requestAnimationFrame(() => {
    placementFrame = 0;
    placeMobileModelAfterHero();
    syncModelAnchor();
  });
}

function watchModelPlacement() {
  const main = document.querySelector('main');
  if (!main || placementObserver) return;

  placementObserver = new MutationObserver(() => schedulePlacementSync());
  placementObserver.observe(main, { childList: true });
}

function syncModelAnchor() {
  const stage = document.querySelector('.brisa-pavilion-model-stage');
  const mobile = document.querySelector('.brisa-pavilion-model-mobile');
  if (!stage || !mobile) return;

  const compact = window.matchMedia('(max-width: 760px)').matches;
  stage.id = compact ? '' : 'project-3d-model';
  mobile.id = compact ? 'project-3d-model' : '';
  scrollToModelIfRequested();
}

function scrollToModelIfRequested(force = false) {
  if (window.location.hash !== '#project-3d-model') return;
  if (modelHashScrollDone && !force) return;

  const target = document.getElementById('project-3d-model');
  if (!target) return;

  modelHashScrollDone = true;
  window.setTimeout(() => target.scrollIntoView({ block: 'start', behavior: 'smooth' }), 80);
}

function renderIntroActions(intro, copy) {
  intro.querySelectorAll(
    '.project-hero__actions, .project-hero__intro-actions:not(.brisa-pavilion-intro-actions)',
  ).forEach((node) => node.remove());

  let actions = intro.querySelector('.brisa-pavilion-intro-actions');
  if (!actions) {
    actions = makeElement('div', 'brisa-pavilion-intro-actions');
    intro.append(actions);
  }

  actions.replaceChildren();
  [
    [copy.readProject, '#project-description', 'btn btn-primary'],
    [copy.viewGallery, '#project-gallery', 'btn btn-ghost'],
    [copy.viewModel, '#project-3d-model', 'btn btn-ghost'],
  ].forEach(([label, href, className]) => {
    const link = makeElement('a', className, label);
    link.href = href;
    actions.append(link);
  });
}

function applyBrisaPavilion3d() {
  if (document.body.dataset.project !== 'brisa-pavilion') return;

  const copy = BRISA_PAVILION_COPY[getLang()];
  const hero = document.querySelector('#project-hero');
  const visual = hero?.querySelector('.hero-visual');
  const intro = hero?.querySelector('.project-hero__intro');
  if (!hero || !visual || !intro) return;

  hero.querySelectorAll('.project-hero__card, .project-hero__hotspots').forEach((node) => node.remove());
  document.body.classList.add('brisa-pavilion-3d-ready');
  renderModelStage(visual, copy);
  renderMobileModel(copy);
  placeMobileModelAfterHero();
  syncModelAnchor();
  watchModelPlacement();
  renderIntroActions(intro, copy);
}

function scheduleApply(delay = 0) {
  window.setTimeout(applyBrisaPavilion3d, delay);
}

window.BrisaPavilion3d = { apply: applyBrisaPavilion3d };
window.addEventListener('DOMContentLoaded', () => {
  BRISA_APPLY_DELAYS.forEach(scheduleApply);
});
window.addEventListener('load', () => BRISA_APPLY_DELAYS.forEach(scheduleApply));
window.addEventListener('langchange', () => {
  BRISA_APPLY_DELAYS.forEach(scheduleApply);
});
window.addEventListener('resize', () => syncModelAnchor());
window.addEventListener('hashchange', () => {
  modelHashScrollDone = false;
  scrollToModelIfRequested(true);
});
