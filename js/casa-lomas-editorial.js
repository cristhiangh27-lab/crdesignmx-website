const CASA_LOMAS_IMAGES = [
  { src: 'projects/casa-lomas/img/Vista%20princ2.jpg', key: 'facade' },
  { src: 'projects/casa-lomas/img/Miradorlomas01.jpg', key: 'stair' },
  { src: 'projects/casa-lomas/img/CALOM1.jpg', key: 'interiorStair' },
  { src: 'projects/casa-lomas/img/CALOM2.jpg', key: 'patio' },
  { src: 'projects/casa-lomas/img/CALOM3.jpg', key: 'garden' },
  { src: 'projects/casa-lomas/img/CALOM4.jpg', key: 'brickDetail' },
  { src: 'projects/casa-lomas/img/CALOM5.jpg', key: 'interiorFrame' },
  { src: 'projects/casa-lomas/img/CALOM6.jpg', key: 'upperVolume' },
];

const CASA_LOMAS_MODEL = 'projects/casa-lomas/models/casa_lomas_optimizado.glb?v=colors-1';

const CASA_LOMAS_COPY = {
  en: {
    title: 'Casa Lomas',
    kicker: 'Featured project',
    location: 'Veracruz, Mexico',
    year: '2024',
    category: 'Residential',
    heroSummary: 'A contemporary residence organized around a social kitchen and living spaces connected to the exterior.',
    readProject: 'Read project',
    viewGallery: 'View gallery',
    viewModel: 'View 3D model',
    modelAlt: 'Interactive 3D model of Casa Lomas',
    sectionsKicker: 'Project sections',
    sectionsTitle: 'Project sections',
    activeLabel: 'Active section',
    descriptionTitle: 'Description',
    galleryTitle: 'Gallery',
    factsTitle: 'Project facts',
    facts: [
      ['Location', 'Veracruz, Mexico'],
      ['Year', '2024'],
      ['Typology', 'Residential'],
      ['Scope', 'Concept / BIM / Documentation'],
      ['Status', 'Portfolio project'],
    ],
    description: {
      intro: 'Casa Lomas brings everyday life into a clear social sequence where kitchen, dining room and exterior areas work as one continuous domestic core. The house is conceived as a restrained architectural object, defined by clean volumes, controlled openings and a facade that combines brick texture, white planes and deep shadow.',
      sections: [
        {
          title: 'Architectural idea',
          body: 'The project aims for a contemporary presence without losing warmth. Its composition is built through mass and void: solid walls provide privacy, precise apertures bring in daylight, and double-height spaces expand the interior experience.',
        },
        {
          title: 'BIM process',
          body: 'The model was used as a design-control tool to review proportions, document constructive criteria and keep the architectural reading clear before technical development.',
        },
        {
          title: 'Materiality',
          body: 'Exposed brick gives texture, scale and permanence. White planes and concrete balance the composition, while natural light sharpens the depth of eaves, columns and brick screens.',
        },
        {
          title: 'Program',
          body: 'The interior sequence gives priority to the kitchen and the social areas, then gradually moves toward more private family rooms, service areas and the roof garden.',
          bullets: [
            'Main access with a defined arrival sequence',
            'Double-height living room',
            'Main kitchen with central island',
            'Dining room integrated with the social area',
            'Family bedrooms with greater privacy',
            'Roof garden as an outdoor extension',
            'Integrated service area',
          ],
        },
        {
          title: 'Synthesis',
          body: 'The proposal favors readable architecture: few gestures, clear circulation and a material palette strong enough to hold presence without formal excess.',
        },
      ],
    },
    sections: [
      {
        key: 'concept',
        label: 'Concept',
        body: 'A contemporary spatial composition with clear volumes and controlled natural light.',
        bullets: [
          'A compact volume with a calm, legible presence',
          'Openings placed to balance privacy and daylight',
          'A contemporary facade shaped by mass, shadow and aperture',
        ],
        cta: 'Read concept',
        href: '#project-description',
        image: 'projects/casa-lomas/img/Vista%20princ2.jpg',
      },
      {
        key: 'bim',
        label: 'BIM process',
        body: 'Coordinated modeling supports documentation, design decisions and constructability checks.',
        bullets: [
          'Coordinated model for documentation',
          'Design and constructability control',
          'A base for technical development',
        ],
        cta: 'View process',
        href: '#project-description',
        image: 'projects/casa-lomas/img/XMPL1.png',
      },
      {
        key: 'materiality',
        label: 'Materiality',
        body: 'Brick, concrete and white volumes define a sober palette where texture and light carry the atmosphere.',
        bullets: [
          'Exposed brick as the main texture',
          'White volumes and restrained concrete',
          'Contrast between mass, shadow and natural light',
        ],
        cta: 'View materiality',
        href: '#project-description',
        image: 'projects/casa-lomas/img/CALOM4.jpg',
      },
      {
        key: 'program',
        label: 'Program',
        body: 'The house organizes daily life around a prominent kitchen, social rooms and a fluid connection with the exterior.',
        bullets: [
          'Main access',
          'Double-height living room',
          'Main kitchen with central island',
          'Integrated dining room',
          'Family bedrooms',
          'Roof garden',
          'Service area',
        ],
        cta: 'Review program',
        href: '#project-description',
        image: 'projects/casa-lomas/img/CALOM2.jpg',
      },
      {
        key: 'gallery',
        label: 'Gallery',
        body: 'A compact visual sequence of construction moments, material details and architectural atmosphere.',
        bullets: [
          'Visual walkthrough of the project',
          'Process and atmospheric imagery',
          'Selected architectural details',
        ],
        cta: 'View images',
        href: '#project-gallery',
        image: 'projects/casa-lomas/img/Miradorlomas01.jpg',
      },
    ],
    gallery: {
      kicker: 'Visual sequence',
      title: 'Casa Lomas in eight frames',
      hint: 'Select a frame',
      labels: [
        'Facade and brick screen',
        'Exterior stair and evening light',
        'Interior stair',
        'Structure and exterior patio',
        'Garden view',
        'Roof and brick detail',
        'Interior frame toward the exterior',
        'Upper volume and sky',
      ],
    },
  },
  es: {
    title: 'Casa Lomas',
    kicker: 'Proyecto destacado',
    location: 'Veracruz, México',
    year: '2024',
    category: 'Residencial',
    heroSummary: 'Residencia contemporánea con cocina protagonista y espacios sociales integrados al exterior.',
    readProject: 'Leer proyecto',
    viewGallery: 'Ver galería',
    viewModel: 'Ver modelo 3D',
    modelAlt: 'Modelo 3D interactivo de Casa Lomas',
    sectionsKicker: 'Secciones del proyecto',
    sectionsTitle: 'Secciones del proyecto',
    activeLabel: 'Sección activa',
    descriptionTitle: 'Descripción',
    galleryTitle: 'Galería',
    factsTitle: 'Ficha del proyecto',
    facts: [
      ['Ubicación', 'Veracruz, México'],
      ['Año', '2024'],
      ['Tipología', 'Residencial'],
      ['Alcance', 'Concepto / BIM / Documentación'],
      ['Estado', 'Proyecto de portafolio'],
    ],
    description: {
      intro: 'Casa Lomas concentra la vida diaria alrededor de una planta social abierta, donde cocina, comedor y exterior se conectan como una sola secuencia doméstica. La casa se plantea como una pieza sobria, con volúmenes claros, aperturas controladas y una fachada que combina ladrillo, planos blancos y sombras profundas.',
      sections: [
        {
          title: 'Idea arquitectónica',
          body: 'El proyecto busca una presencia contemporánea sin perder calidez. La composición trabaja con masa y vacío: muros sólidos para dar privacidad, ventanas precisas para capturar luz y dobles alturas para ampliar la percepción interior.',
        },
        {
          title: 'Proceso BIM',
          body: 'El modelo se usó como herramienta de control para revisar proporciones, documentar criterios constructivos y mantener una lectura clara del proyecto antes de pasar a desarrollo técnico.',
        },
        {
          title: 'Materialidad',
          body: 'El ladrillo aparente da textura, escala y permanencia. Los planos blancos y el concreto equilibran la composición, mientras la luz natural acentúa la profundidad de aleros, columnas y celosías.',
        },
        {
          title: 'Programa',
          body: 'La secuencia interior da prioridad a la cocina y a las áreas sociales, después avanza hacia recámaras familiares, servicios y roof garden con mayor privacidad.',
          bullets: [
            'Acceso principal con llegada definida',
            'Sala de doble altura',
            'Cocina protagonista con barra central',
            'Comedor integrado a la zona social',
            'Recámaras familiares con mayor privacidad',
            'Roof garden como extensión exterior',
            'Área de servicio integrada',
          ],
        },
        {
          title: 'Síntesis',
          body: 'La propuesta privilegia una arquitectura legible: pocos gestos, buena circulación y una materialidad capaz de sostener presencia sin exceso formal.',
        },
      ],
    },
    sections: [
      {
        key: 'concept',
        label: 'Concepto',
        body: 'Composición espacial contemporánea con claridad volumétrica y luz natural controlada.',
        bullets: [
          'Un volumen compacto con presencia sobria y legible',
          'Aperturas ubicadas para equilibrar privacidad y luz',
          'Fachada contemporánea construida con masa, sombra y apertura',
        ],
        cta: 'Leer concepto',
        href: '#project-description',
        image: 'projects/casa-lomas/img/Vista%20princ2.jpg',
      },
      {
        key: 'bim',
        label: 'Proceso BIM',
        body: 'Modelo coordinado para documentar, revisar decisiones de diseño y controlar constructibilidad.',
        bullets: [
          'Modelo coordinado para documentación',
          'Control de diseño y constructibilidad',
          'Base para desarrollo técnico',
        ],
        cta: 'Ver proceso',
        href: '#project-description',
        image: 'projects/casa-lomas/img/XMPL1.png',
      },
      {
        key: 'materiality',
        label: 'Materialidad',
        body: 'Ladrillo, concreto y planos blancos componen una paleta sobria donde textura y luz sostienen la atmósfera.',
        bullets: [
          'Ladrillo aparente como textura principal',
          'Volúmenes blancos y concreto sobrio',
          'Contraste entre masa, sombra y luz natural',
        ],
        cta: 'Ver materialidad',
        href: '#project-description',
        image: 'projects/casa-lomas/img/CALOM4.jpg',
      },
      {
        key: 'program',
        label: 'Programa',
        body: 'La casa ordena la vida cotidiana alrededor de una cocina protagonista, áreas sociales y conexión fluida al exterior.',
        bullets: [
          'Acceso principal',
          'Sala de doble altura',
          'Cocina protagonista con barra central',
          'Comedor integrado',
          'Recámaras familiares',
          'Roof garden',
          'Área de servicio',
        ],
        cta: 'Revisar programa',
        href: '#project-description',
        image: 'projects/casa-lomas/img/CALOM2.jpg',
      },
      {
        key: 'gallery',
        label: 'Galería',
        body: 'Una secuencia visual compacta de proceso, materia y atmósfera arquitectónica.',
        bullets: [
          'Recorrido visual del proyecto',
          'Imágenes de proceso y atmósfera',
          'Detalles arquitectónicos seleccionados',
        ],
        cta: 'Ver imágenes',
        href: '#project-gallery',
        image: 'projects/casa-lomas/img/Miradorlomas01.jpg',
      },
    ],
    gallery: {
      kicker: 'Secuencia visual',
      title: 'Casa Lomas en ocho encuadres',
      hint: 'Selecciona un encuadre',
      labels: [
        'Fachada y celosía de ladrillo',
        'Escalera exterior y luz de atardecer',
        'Escalera interior',
        'Estructura y patio exterior',
        'Vista de jardín',
        'Detalle de cubierta y ladrillo',
        'Encuadre interior hacia exterior',
        'Volumen superior y cielo',
      ],
    },
  },
  de: {
    title: 'Casa Lomas',
    kicker: 'Ausgewähltes Projekt',
    location: 'Veracruz, Mexiko',
    year: '2024',
    category: 'Wohnen',
    heroSummary: 'Ein zeitgenössisches Wohnhaus mit prägnanter Küche und sozialen Räumen, die sich zum Außenraum verbinden.',
    readProject: 'Projekt lesen',
    viewGallery: 'Galerie ansehen',
    viewModel: '3D-Modell ansehen',
    modelAlt: 'Interaktives 3D-Modell von Casa Lomas',
    sectionsKicker: 'Projektabschnitte',
    sectionsTitle: 'Projektabschnitte',
    activeLabel: 'Aktiver Abschnitt',
    descriptionTitle: 'Beschreibung',
    galleryTitle: 'Galerie',
    factsTitle: 'Projektdaten',
    facts: [
      ['Ort', 'Veracruz, Mexiko'],
      ['Jahr', '2024'],
      ['Typologie', 'Wohnen'],
      ['Leistung', 'Konzept / BIM / Dokumentation'],
      ['Status', 'Portfolio-Projekt'],
    ],
    description: {
      intro: 'Casa Lomas ordnet den Alltag um eine klare soziale Sequenz: Küche, Essbereich und Außenraum werden als zusammenhängender Wohnkern gelesen. Das Haus ist als zurückhaltender Baukörper konzipiert, mit klaren Volumen, kontrollierten Öffnungen und einer Fassade aus Ziegeltextur, weißen Flächen und tiefen Schatten.',
      sections: [
        {
          title: 'Architektonische Idee',
          body: 'Das Projekt sucht eine zeitgenössische Präsenz, ohne Wärme zu verlieren. Die Komposition arbeitet mit Masse und Leere: geschlossene Flächen schützen die Privatheit, präzise Öffnungen führen Tageslicht ein, und doppelhohe Räume erweitern die Innenwahrnehmung.',
        },
        {
          title: 'BIM-Prozess',
          body: 'Das Modell diente als Kontrollinstrument, um Proportionen zu prüfen, konstruktive Kriterien zu dokumentieren und die architektonische Lesbarkeit vor der technischen Ausarbeitung zu sichern.',
        },
        {
          title: 'Materialität',
          body: 'Sichtziegel gibt Textur, Maßstab und Dauerhaftigkeit. Weiße Flächen und Beton balancieren die Komposition, während Tageslicht die Tiefe von Auskragungen, Stützen und Ziegelschirmen betont.',
        },
        {
          title: 'Programm',
          body: 'Die innere Sequenz priorisiert Küche und soziale Räume und führt anschließend zu Familienzimmern, Servicebereichen und Dachgarten mit größerer Privatheit.',
          bullets: [
            'Haupteingang mit klarer Ankunftssequenz',
            'Doppelhoher Wohnraum',
            'Prägnante Küche mit zentraler Insel',
            'Essbereich als Teil der sozialen Zone',
            'Familienzimmer mit größerer Privatheit',
            'Dachgarten als Außenraumerweiterung',
            'Integrierter Servicebereich',
          ],
        },
        {
          title: 'Synthese',
          body: 'Der Entwurf setzt auf lesbare Architektur: wenige Gesten, klare Erschließung und eine Materialität, die Präsenz ohne formale Übertreibung erzeugt.',
        },
      ],
    },
    sections: [
      {
        key: 'concept',
        label: 'Konzept',
        body: 'Zeitgenössische Raumkomposition mit klarer Volumetrie und kontrolliertem Tageslicht.',
        bullets: [
          'Ein kompakter Baukörper mit ruhiger, lesbarer Präsenz',
          'Öffnungen im Gleichgewicht zwischen Privatheit und Licht',
          'Eine Fassade aus Masse, Schatten und Öffnung',
        ],
        cta: 'Konzept lesen',
        href: '#project-description',
        image: 'projects/casa-lomas/img/Vista%20princ2.jpg',
      },
      {
        key: 'bim',
        label: 'BIM-Prozess',
        body: 'Koordiniertes Modellieren unterstützt Dokumentation, Entwurfsentscheidungen und konstruktive Kontrolle.',
        bullets: [
          'Koordiniertes Modell für die Dokumentation',
          'Kontrolle von Entwurf und Konstruierbarkeit',
          'Grundlage für technische Entwicklung',
        ],
        cta: 'Prozess ansehen',
        href: '#project-description',
        image: 'projects/casa-lomas/img/XMPL1.png',
      },
      {
        key: 'materiality',
        label: 'Materialität',
        body: 'Ziegel, Beton und weiße Volumen bilden eine ruhige Palette, in der Textur und Licht die Atmosphäre tragen.',
        bullets: [
          'Sichtziegel als zentrale Textur',
          'Weiße Volumen und zurückhaltender Beton',
          'Kontrast zwischen Masse, Schatten und Tageslicht',
        ],
        cta: 'Materialität ansehen',
        href: '#project-description',
        image: 'projects/casa-lomas/img/CALOM4.jpg',
      },
      {
        key: 'program',
        label: 'Programm',
        body: 'Das Haus organisiert den Alltag um eine prägnante Küche, soziale Räume und eine fließende Verbindung zum Außenraum.',
        bullets: [
          'Haupteingang',
          'Doppelhoher Wohnraum',
          'Prägnante Küche mit zentraler Insel',
          'Integrierter Essbereich',
          'Familienzimmer',
          'Dachgarten',
          'Servicebereich',
        ],
        cta: 'Programm prüfen',
        href: '#project-description',
        image: 'projects/casa-lomas/img/CALOM2.jpg',
      },
      {
        key: 'gallery',
        label: 'Galerie',
        body: 'Eine kompakte visuelle Sequenz aus Prozess, Material und architektonischer Atmosphäre.',
        bullets: [
          'Visueller Rundgang durch das Projekt',
          'Bilder von Prozess und Atmosphäre',
          'Ausgewählte architektonische Details',
        ],
        cta: 'Bilder ansehen',
        href: '#project-gallery',
        image: 'projects/casa-lomas/img/Miradorlomas01.jpg',
      },
    ],
    gallery: {
      kicker: 'Bildsequenz',
      title: 'Casa Lomas in acht Bildern',
      hint: 'Bild auswählen',
      labels: [
        'Fassade und Ziegelschirm',
        'Außentreppe und Abendlicht',
        'Innentreppe',
        'Struktur und Außenhof',
        'Gartenblick',
        'Dach- und Ziegeldetail',
        'Innenrahmung zum Außenraum',
        'Oberes Volumen und Himmel',
      ],
    },
  },
};

let activeSectionIndex = 0;
let modelHashScrollDone = false;

function getRootPath() {
  if (window.__SITE_ROOT__) return window.__SITE_ROOT__;
  const { pathname } = window.location;
  return pathname.includes('/projects/') && !pathname.endsWith('/projects.html') ? '../..' : '.';
}

function getLang() {
  const lang = window.__i18n?.lang || localStorage.getItem('lang') || document.documentElement.lang || 'en';
  return Object.prototype.hasOwnProperty.call(CASA_LOMAS_COPY, lang) ? lang : 'en';
}

function asset(path) {
  return new URL(`${getRootPath()}/${path}`, window.location.href).toString();
}

function clear(node) {
  if (node) node.replaceChildren();
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function makeLink(label, href, variant = 'btn btn-ghost') {
  const link = makeElement('a', variant, label);
  link.href = href;
  return link;
}

function createModelViewer(copy) {
  const model = document.createElement('model-viewer');
  model.className = 'casa-lomas-model';
  model.setAttribute('src', asset(CASA_LOMAS_MODEL));
  model.setAttribute('alt', copy.modelAlt);
  model.setAttribute('camera-controls', '');
  model.setAttribute('touch-action', 'pan-y');
  model.setAttribute('auto-rotate', '');
  model.setAttribute('auto-rotate-delay', '1200');
  model.setAttribute('rotation-per-second', '16deg');
  model.setAttribute('ar', '');
  model.setAttribute('ar-modes', 'scene-viewer webxr');
  model.setAttribute('shadow-intensity', '0.72');
  model.setAttribute('exposure', '0.9');
  model.setAttribute('environment-image', 'neutral');
  model.setAttribute('camera-orbit', '38deg 66deg auto');
  model.setAttribute('min-camera-orbit', 'auto 16deg auto');
  model.setAttribute('max-camera-orbit', 'auto 86deg auto');

  const arButton = makeElement('button', 'casa-lomas-model__ar', 'AR');
  arButton.type = 'button';
  arButton.slot = 'ar-button';
  arButton.setAttribute('aria-label', 'Open Casa Lomas in augmented reality');
  model.append(arButton);

  return model;
}

function renderModelStage(visual, copy) {
  visual.querySelector('.casa-lomas-model-stage')?.remove();

  const stage = makeElement('div', 'casa-lomas-model-stage');
  stage.setAttribute('aria-label', copy.modelAlt);
  stage.append(createModelViewer(copy));
  visual.append(stage);
}

function renderMobileModel(copy) {
  document.querySelector('.casa-lomas-model-mobile')?.remove();
  const hero = document.querySelector('#project-hero');
  if (!hero) return;

  const section = makeElement('section', 'casa-lomas-model-mobile');
  section.id = 'project-3d-model';
  section.setAttribute('aria-label', copy.modelAlt);
  section.append(createModelViewer(copy));
  hero.insertAdjacentElement('afterend', section);
}

function syncModelAnchor() {
  const stage = document.querySelector('.casa-lomas-model-stage');
  const mobile = document.querySelector('.casa-lomas-model-mobile');
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

function renderHero(copy) {
  const hero = document.querySelector('#project-hero');
  const visual = hero?.querySelector('.hero-visual');
  const intro = hero?.querySelector('.project-hero__intro');
  if (!hero || !visual || !intro) return;

  hero.querySelectorAll('.explorer-topbar, .explorer-modal, .explorer-dots, .project-hero__hotspots, .project-hero__card').forEach((node) => node.remove());
  renderModelStage(visual, copy);

  const image = visual.querySelector('img');
  const placeholder = visual.querySelector('.placeholder');
  if (placeholder) placeholder.hidden = true;
  if (image) {
    image.src = asset('projects/casa-lomas/img/XMPL1.png');
    image.alt = copy.title;
    image.hidden = false;
  }

  const kicker = intro.querySelector('.section-lead') || makeElement('p', 'section-lead');
  kicker.textContent = copy.kicker;
  const title = intro.querySelector('h1') || makeElement('h1');
  title.textContent = copy.title;
  const meta = intro.querySelector('.project-meta') || makeElement('div', 'project-meta');
  clear(meta);
  [copy.location, copy.year, copy.category].forEach((item) => {
    const badge = makeElement('span', 'badge', item);
    meta.append(badge);
  });
  const summary = intro.querySelector('.summary') || makeElement('p', 'summary');
  summary.textContent = copy.heroSummary;

  let actions = intro.querySelector('.project-hero__intro-actions');
  if (!actions) {
    actions = makeElement('div', 'project-hero__intro-actions');
    intro.append(actions);
  }
  clear(actions);
  actions.append(
    makeLink(copy.readProject, '#project-description', 'btn btn-primary'),
    makeLink(copy.viewGallery, '#project-gallery', 'btn btn-ghost'),
    makeLink(copy.viewModel, '#project-3d-model', 'btn btn-ghost'),
  );
}

function updateSectionState(section, copy) {
  const cards = [...section.querySelectorAll('.project-section-card')];
  const panel = section.querySelector('.project-sections__panel');
  const active = copy.sections[activeSectionIndex];
  const lastIndex = copy.sections.length - 1;
  const prevIndex = activeSectionIndex === 0 ? lastIndex : activeSectionIndex - 1;
  const nextIndex = activeSectionIndex === lastIndex ? 0 : activeSectionIndex + 1;

  cards.forEach((card, index) => {
    const isActive = index === activeSectionIndex;
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

  if (panel && active) {
    const panelCopy = makeElement('div', 'project-sections__panel-copy');
    panelCopy.append(
      makeElement('p', 'section-lead', copy.activeLabel),
      makeElement('h3', '', active.label),
      makeElement('p', '', active.body),
    );

    const list = makeElement('ul');
    active.bullets.forEach((bullet) => list.append(makeElement('li', '', bullet)));
    panelCopy.append(list, makeLink(active.cta, active.href, 'btn btn-primary'));

    const image = document.createElement('img');
    image.src = asset(active.image);
    image.alt = active.label;
    image.loading = 'lazy';

    clear(panel);
    panel.append(panelCopy, image);
    panel.classList.add('is-ready');
  }

  const activeCard = cards[activeSectionIndex];
  if (activeCard && window.matchMedia('(max-width: 760px)').matches) {
    activeCard.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }
}

function renderSections(copy) {
  document.querySelector('.project-sections--casa-lomas')?.remove();
  const hero = document.querySelector('#project-hero');
  if (!hero) return;

  const section = makeElement('section', 'project-sections project-sections--casa-lomas');
  section.id = 'project-sections';
  section.setAttribute('aria-labelledby', 'project-sections-title');

  const header = makeElement('div', 'project-sections__header');
  header.append(
    makeElement('p', 'section-lead', copy.sectionsKicker),
    makeElement('h2', '', copy.sectionsTitle),
  );
  header.querySelector('h2').id = 'project-sections-title';

  const shell = makeElement('div', 'project-sections__shell');
  const prev = makeElement('button', 'project-sections__arrow project-sections__arrow--prev', '<');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous section');
  const next = makeElement('button', 'project-sections__arrow project-sections__arrow--next', '>');
  next.type = 'button';
  next.setAttribute('aria-label', 'Next section');
  const track = makeElement('div', 'project-sections__track');
  const panel = makeElement('div', 'project-sections__panel');

  copy.sections.forEach((item, index) => {
    const card = makeElement('button', `project-section-card project-hotspot--${item.key}`);
    card.type = 'button';
    card.setAttribute('aria-label', item.label);

    const media = makeElement('span', 'project-section-card__media');
    media.style.backgroundImage = `url("${asset(item.image)}")`;
    const label = makeElement('span', '', item.label);
    card.append(media, label);
    card.addEventListener('click', () => {
      activeSectionIndex = index;
      updateSectionState(section, copy);
    });
    track.append(card);
  });

  prev.addEventListener('click', () => {
    activeSectionIndex = activeSectionIndex === 0 ? copy.sections.length - 1 : activeSectionIndex - 1;
    updateSectionState(section, copy);
  });
  next.addEventListener('click', () => {
    activeSectionIndex = (activeSectionIndex + 1) % copy.sections.length;
    updateSectionState(section, copy);
  });

  shell.append(prev, track, next);
  section.append(header, shell, panel);
  hero.insertAdjacentElement('afterend', section);
  updateSectionState(section, copy);
}

function renderDescription(copy) {
  const section = document.querySelector('#project-description');
  const title = section?.querySelector('h2');
  const content = section?.querySelector('.content');
  if (!section || !title || !content) return;

  section.classList.add('project-description--editorial');
  title.textContent = copy.descriptionTitle;
  title.removeAttribute('data-i18n');
  clear(content);

  const body = makeElement('div', 'project-description__body');
  body.append(makeElement('p', '', copy.description.intro));
  copy.description.sections.forEach((item) => {
    body.append(makeElement('h2', '', item.title), makeElement('p', '', item.body));
    if (item.bullets) {
      const list = makeElement('ul');
      item.bullets.forEach((bullet) => list.append(makeElement('li', '', bullet)));
      body.append(list);
    }
  });

  const facts = makeElement('aside', 'project-description__meta');
  facts.append(makeElement('h3', '', copy.factsTitle));
  copy.facts.forEach(([label, value]) => {
    const line = makeElement('p');
    const strong = makeElement('strong', '', `${label}: `);
    line.append(strong, document.createTextNode(value));
    facts.append(line);
  });

  content.append(body, facts);
}

function renderGallery(copy) {
  const section = document.querySelector('#project-gallery');
  const title = section?.querySelector('h2');
  const grid = section?.querySelector('.grid');
  if (!section || !title || !grid) return;

  section.classList.add('project-gallery--showcase');
  title.textContent = copy.galleryTitle;
  title.removeAttribute('data-i18n');
  grid.className = 'grid project-gallery__showcase';
  clear(grid);

  const feature = makeElement('figure', 'project-gallery__feature');
  const featureImage = document.createElement('img');
  featureImage.src = asset(CASA_LOMAS_IMAGES[0].src);
  featureImage.alt = copy.gallery.labels[0];
  featureImage.loading = 'eager';
  const caption = makeElement('figcaption', 'project-gallery__caption');
  caption.append(
    makeElement('p', 'section-lead', copy.gallery.kicker),
    makeElement('h3', '', copy.gallery.title),
    makeElement('span', '', '01 / 08'),
  );
  feature.append(featureImage, caption);

  const thumbs = makeElement('div', 'project-gallery__thumbs');
  thumbs.setAttribute('aria-label', copy.gallery.hint);
  CASA_LOMAS_IMAGES.forEach((item, index) => {
    const thumb = makeElement('button', 'project-gallery__thumb');
    thumb.type = 'button';
    thumb.setAttribute('aria-label', `${copy.gallery.hint} ${index + 1}`);
    const thumbImage = document.createElement('img');
    thumbImage.src = asset(item.src);
    thumbImage.alt = copy.gallery.labels[index];
    thumbImage.loading = 'lazy';
    thumb.append(thumbImage, makeElement('span', '', String(index + 1).padStart(2, '0')));
    thumb.addEventListener('click', () => {
      featureImage.src = asset(item.src);
      featureImage.alt = copy.gallery.labels[index];
      caption.querySelector('span').textContent = `${String(index + 1).padStart(2, '0')} / 08`;
      thumbs.querySelectorAll('.project-gallery__thumb').forEach((button) => button.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
    if (index === 0) thumb.classList.add('is-active');
    thumbs.append(thumb);
  });

  grid.append(feature, thumbs);
}

function applyCasaLomasEditorial() {
  if (document.body.dataset.project !== 'casa-lomas') return;
  const copy = CASA_LOMAS_COPY[getLang()];
  document.body.classList.add('casa-lomas-editorial-ready');
  renderHero(copy);
  renderSections(copy);
  renderMobileModel(copy);
  syncModelAnchor();
  renderDescription(copy);
  renderGallery(copy);
}

function scheduleApply(delay = 0) {
  window.setTimeout(applyCasaLomasEditorial, delay);
}

window.CasaLomasEditorial = { apply: applyCasaLomasEditorial };
window.addEventListener('DOMContentLoaded', () => {
  scheduleApply(250);
  scheduleApply(850);
});
window.addEventListener('load', () => scheduleApply(200));
window.addEventListener('langchange', () => {
  scheduleApply(180);
  scheduleApply(520);
});
window.addEventListener('resize', () => syncModelAnchor());
window.addEventListener('hashchange', () => {
  modelHashScrollDone = false;
  scrollToModelIfRequested(true);
});
