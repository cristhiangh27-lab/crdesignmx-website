const googleReviews = [
  {
    author: 'Nadia #!',
    time: 'Hace 4 semanas',
    stars: 5,
    source: 'Google Review',
    text: 'He visto algunos de sus proyectos y propuestas y me gusta mucho cómo trabajan los espacios: funcionales, bien pensados y con una estética muy cuidada. Además, el trato es cercano y profesional, lo que da mucha tranquilidad cuando se trata de algo tan importante como una vivienda o una reforma.\nMuy recomendable por su implicación y su forma de hacer las cosas.'
  },
  {
    author: 'Ximena Arredondo',
    time: 'Hace 1 semana',
    stars: 5,
    source: 'Google Review',
    text: 'El arquitecto es muy entregado y capaz, impecable en su trabajo y atento a todo lo que pedimos. Entrega en tiempo y forma, pocos profesionistas como él.\nConfío plenamente en el Arq. Cristhian.'
  },
  {
    author: 'Filipe Almas',
    time: 'Hace 2 semanas',
    stars: 5,
    source: 'Google Review',
    text: 'Já tive oportunidade de conhecer os projetos do atelier apresentados pelo arquiteto Cristhian. Quero destacar o profissionalismo do mesmo, o empenho e o rigor que emprega em cada trabalho que faz. É bom ver novos arquitetos em ascensão, especialmente quando o trabalho que desenvolvem é cuidado e meticuloso.'
  }
];

function getInitials(author = '') {
  const words = author
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}]/gu, ''))
    .filter(Boolean);

  if (!words.length) return 'CR';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
}

function renderReviewStars(stars = 0) {
  return '★'.repeat(Math.max(0, stars)) + '☆'.repeat(Math.max(0, 5 - stars));
}

function createReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'review-card founder-card reveal';

  const header = document.createElement('div');
  header.className = 'review-card-header';

  const avatar = document.createElement('span');
  avatar.className = 'review-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = getInitials(review.author);

  const meta = document.createElement('div');
  meta.className = 'review-meta';

  const author = document.createElement('p');
  author.className = 'review-author';
  author.textContent = review.author;

  const source = document.createElement('p');
  source.className = 'review-source';
  source.textContent = `${review.source} · ${review.time}`;

  meta.append(author, source);

  const starLine = document.createElement('p');
  starLine.className = 'review-stars';
  starLine.setAttribute('aria-label', `${review.stars} de 5 estrellas`);
  starLine.textContent = renderReviewStars(review.stars);

  const text = document.createElement('p');
  text.className = 'review-text';
  text.textContent = review.text;

  header.append(avatar, meta);
  card.append(header, starLine, text);
  return card;
}

function renderGoogleReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  grid.innerHTML = '';
  googleReviews.forEach((review) => {
    grid.appendChild(createReviewCard(review));
  });
}


function initClientLogoMarquee() {
  const marquee = document.querySelector('[data-logo-marquee]');
  const track = marquee?.querySelector('.logo-marquee-track');
  if (!marquee || !track || track.dataset.loopReady === 'true') return;

  const items = Array.from(track.children);
  if (!items.length) return;

  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  track.dataset.loopReady = 'true';
}

function initRevealAnimations() {
  const revealItems = document.querySelectorAll('.reveal');
  if (!revealItems.length) return;

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

document.addEventListener('DOMContentLoaded', () => {
  renderGoogleReviews();
  initClientLogoMarquee();
  initRevealAnimations();
});
