(function () {
  if (window.CRHexLoader) return;

  const MEDIA_SELECTOR = [
    '[data-cr-loadable]',
    'img:not([data-cr-loader-ignore])',
    'video:not([data-cr-loader-ignore])',
    'iframe:not([data-cr-loader-ignore])',
    'model-viewer:not([data-cr-loader-ignore])',
  ].join(',');

  const SKIP_SELECTOR = [
    '.site-header',
    '.site-footer',
    '.email-float',
    '.floating-email-btn',
    '.float-email',
    '.language-selector',
    '.cr-loader',
    '[data-cr-loader-ignore]',
  ].join(',');

  const MODEL_CONTAINER_SELECTOR = [
    '.brisa-pavilion-model-stage',
    '.brisa-pavilion-model-mobile',
    '.casa-lomas-model-stage',
    '.model-stage',
    '.model-viewer-stage',
    '.project-3d-model',
  ].join(',');

  const MEDIA_CONTAINER_SELECTOR = [
    '[data-cr-loading-container]',
    '.hero-visual',
    '.project-media',
    '.featured-showcase__media',
    '.project-selector-card__media',
    '.works-console__media',
    '.works-console__thumb',
    '.project-gallery__feature',
    '.project-gallery__thumb',
    '.cr-lightbox-image-shell',
    '.studio-approach__media',
    '.founder-photo-media',
    '.founder-video-placeholder',
    '.about-hero__profile',
    '.about-hero__profile-media',
    '.media-frame',
    '.image-frame',
    'figure',
  ].join(',');

  const tracked = new WeakMap();
  const deferredLazyTargets = new WeakSet();
  const loadTimeouts = new WeakMap();
  let scanFrame = 0;
  let observer = null;
  let lazyObserver = null;

  function currentLang() {
    const lang = String(window.__i18n?.lang || localStorage.getItem('lang') || document.documentElement.lang || 'en')
      .slice(0, 2)
      .toLowerCase();
    return ['en', 'es', 'de'].includes(lang) ? lang : 'en';
  }

  function loadingLabel() {
    return {
      en: 'Loading',
      es: 'Cargando',
      de: 'Laden',
    }[currentLang()];
  }

  function hasUsefulSource(target) {
    const tag = target.tagName.toLowerCase();

    if (tag === 'img') {
      const source = target.currentSrc || target.getAttribute('src') || '';
      return source.trim().length > 0 && source !== window.location.href;
    }

    if (tag === 'video') {
      return Boolean(target.currentSrc || target.getAttribute('src') || target.querySelector('source[src]'));
    }

    if (tag === 'iframe' || tag === 'model-viewer') {
      return Boolean(target.getAttribute('src'));
    }

    return true;
  }

  function mediaSignature(target) {
    const tag = target.tagName.toLowerCase();

    if (tag === 'img') return target.currentSrc || target.getAttribute('src') || '';
    if (tag === 'video') {
      const sources = [...target.querySelectorAll('source[src]')].map((source) => source.getAttribute('src')).join('|');
      return target.currentSrc || target.getAttribute('src') || sources || target.getAttribute('poster') || '';
    }
    if (tag === 'iframe' || tag === 'model-viewer') return target.getAttribute('src') || '';
    return `${tag}:${target.dataset.crLoadable || ''}`;
  }

  function isTargetReady(target) {
    const tag = target.tagName.toLowerCase();

    if (!hasUsefulSource(target)) return true;
    if (tag === 'img') return target.complete && target.naturalWidth > 0;
    if (tag === 'video') return target.readyState >= 2;
    if (tag === 'iframe') return target.dataset.crLoaded === 'true';
    if (tag === 'model-viewer') {
      return Boolean(target.loaded || target.modelIsVisible || target.hasAttribute('loaded'));
    }
    return false;
  }

  function isTinyDecor(target) {
    if (target.matches('[data-cr-loadable], model-viewer')) return false;

    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    return rect.width < 74 || rect.height < 54;
  }

  function isLazyPending(target) {
    return target.tagName.toLowerCase() === 'img'
      && target.loading === 'lazy'
      && !isTargetReady(target);
  }

  function isNearViewport(target) {
    const rect = target.getBoundingClientRect();
    const margin = Math.max(window.innerHeight || 800, 760);
    return rect.bottom >= -margin && rect.top <= (window.innerHeight || 800) + margin;
  }

  function deferLazyTarget(target) {
    if (deferredLazyTargets.has(target)) return;
    deferredLazyTargets.add(target);

    if ('IntersectionObserver' in window) {
      if (!lazyObserver) {
        lazyObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            lazyObserver.unobserve(entry.target);
            deferredLazyTargets.delete(entry.target);
            bindTarget(entry.target);
          });
        }, { rootMargin: '900px 0px' });
      }
      lazyObserver.observe(target);
      return;
    }

    window.setTimeout(() => {
      deferredLazyTargets.delete(target);
      bindTarget(target);
    }, 700);
  }

  function findContainer(target) {
    if (target.matches('[data-cr-loadable]')) return target;
    if (target.closest(SKIP_SELECTOR)) return null;

    const tag = target.tagName.toLowerCase();
    if (tag === 'model-viewer') {
      return target.closest(MODEL_CONTAINER_SELECTOR) || target.parentElement;
    }

    const explicit = target.closest('[data-cr-loading-container]');
    if (explicit) return explicit;

    const known = target.closest(MEDIA_CONTAINER_SELECTOR);
    if (known && !known.matches('main, section, .grid')) return known;

    const parent = target.parentElement;
    if (!parent || parent === document.body || parent === document.documentElement) return null;
    if (parent.matches(SKIP_SELECTOR)) return null;
    if (parent.tagName.toLowerCase() === 'picture') return parent.parentElement || parent;

    const mediaCount = parent.querySelectorAll('img, video, iframe, model-viewer').length;
    if (mediaCount === 1 && parent.matches('a, button, figure, picture, .project-card, .founder-card')) {
      return parent;
    }

    return null;
  }

  function ensureLoader(container, target) {
    container.classList.add('cr-loadable');
    if (target.tagName.toLowerCase() === 'model-viewer') container.classList.add('cr-loadable--model');

    const rect = container.getBoundingClientRect();
    if (!rect.height) container.classList.add('cr-loadable--empty');

    if (getComputedStyle(container).position === 'static') {
      container.classList.add('cr-loadable--positioned');
    }

    let loader = container.querySelector(':scope > .cr-loader');
    if (loader) {
      loader.querySelector('.cr-loader__label').textContent = loadingLabel();
      return loader;
    }

    loader = document.createElement('div');
    loader.className = 'cr-loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <span class="cr-loader__unit">
        <span class="cr-loader__ring"></span>
        <span class="cr-loader__hex"></span>
        <span class="cr-loader__core"></span>
      </span>
      <span class="cr-loader__label">${loadingLabel()}</span>
    `;
    container.append(loader);
    return loader;
  }

  function setState(container, state) {
    container.classList.remove('is-loading', 'is-loaded', 'is-error', 'is-timeout');
    container.classList.add(`is-${state}`);
    container.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
  }

  function clearTargetWatch(target) {
    const state = tracked.get(target);
    if (state?.abortController) state.abortController.abort();

    const timeout = loadTimeouts.get(target);
    if (timeout) window.clearTimeout(timeout);
    loadTimeouts.delete(target);
  }

  function finishTarget(target, container, state) {
    clearTargetWatch(target);
    setState(container, state);
  }

  function timeoutForTarget(target) {
    const tag = target.tagName.toLowerCase();
    if (tag === 'model-viewer') return 65000;
    if (tag === 'iframe') return 32000;
    return 22000;
  }

  function watchTarget(target, container) {
    clearTargetWatch(target);

    const abortController = new AbortController();
    const options = { once: true, signal: abortController.signal };
    const done = () => finishTarget(target, container, 'loaded');
    const fail = () => finishTarget(target, container, 'error');
    const tag = target.tagName.toLowerCase();

    tracked.set(target, {
      container,
      signature: mediaSignature(target),
      abortController,
    });

    if (isTargetReady(target)) {
      done();
      return;
    }

    setState(container, 'loading');

    if (tag === 'img') {
      target.addEventListener('load', done, options);
      target.addEventListener('error', fail, options);
    } else if (tag === 'video') {
      target.addEventListener('loadeddata', done, options);
      target.addEventListener('canplay', done, options);
      target.addEventListener('error', fail, options);
    } else if (tag === 'iframe') {
      target.addEventListener('load', () => {
        target.dataset.crLoaded = 'true';
        done();
      }, options);
      target.addEventListener('error', fail, options);
    } else if (tag === 'model-viewer') {
      target.addEventListener('load', done, options);
      target.addEventListener('model-visibility', done, options);
      target.addEventListener('poster-dismissed', done, options);
      target.addEventListener('error', fail, options);
      target.addEventListener('progress', (event) => {
        if (event.detail?.totalProgress >= 1) done();
      }, { signal: abortController.signal });
    }

    const timeout = window.setTimeout(() => {
      if (container.classList.contains('is-loading')) {
        finishTarget(target, container, 'timeout');
      }
    }, timeoutForTarget(target));
    loadTimeouts.set(target, timeout);
  }

  function bindTarget(target) {
    if (!(target instanceof Element)) return;
    if (target.closest(SKIP_SELECTOR) || isTinyDecor(target) || !hasUsefulSource(target)) return;
    if (isLazyPending(target) && !isNearViewport(target)) {
      deferLazyTarget(target);
      return;
    }

    const container = findContainer(target);
    if (!container || container.closest(SKIP_SELECTOR)) return;

    const signature = mediaSignature(target);
    const previous = tracked.get(target);
    if (previous?.signature === signature) return;

    ensureLoader(container, target);
    watchTarget(target, container);
  }

  function scan(root = document) {
    const scope = root instanceof Element || root instanceof Document ? root : document;

    if (scope.matches?.(MEDIA_SELECTOR)) bindTarget(scope);
    scope.querySelectorAll?.(MEDIA_SELECTOR).forEach(bindTarget);
  }

  function scheduleScan(root = document) {
    if (scanFrame) window.cancelAnimationFrame(scanFrame);
    scanFrame = window.requestAnimationFrame(() => {
      scanFrame = 0;
      scan(root);
    });
  }

  function updateLabels() {
    document.querySelectorAll('.cr-loader__label').forEach((label) => {
      label.textContent = loadingLabel();
    });
  }

  function watchMutations() {
    if (observer || !document.documentElement) return;

    observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          bindTarget(mutation.target);
          return;
        }

        if ([...mutation.addedNodes].some((node) => node.nodeType === Node.ELEMENT_NODE)) {
          shouldScan = true;
        }
      });

      if (shouldScan) scheduleScan();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'poster'],
    });
  }

  window.CRHexLoader = {
    scan,
    refresh: scheduleScan,
  };

  watchMutations();
  scheduleScan();

  document.addEventListener('DOMContentLoaded', () => scheduleScan());
  window.addEventListener('load', () => {
    scheduleScan();
    window.setTimeout(scheduleScan, 650);
  });
  window.addEventListener('langchange', () => {
    updateLabels();
    scheduleScan();
  });
})();
