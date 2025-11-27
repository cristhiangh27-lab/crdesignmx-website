(function() {
  function markdownToHtml(md) {
    const lines = md.replace(/\r\n?/g, "\n").split("\n");
    let html = "";
    let inList = false;

    const closeListIfNeeded = () => {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (/^###\s+/.test(trimmed)) {
        closeListIfNeeded();
        html += `<h3>${trimmed.replace(/^###\s+/, "")}</h3>`;
      } else if (/^##\s+/.test(trimmed)) {
        closeListIfNeeded();
        html += `<h2>${trimmed.replace(/^##\s+/, "")}</h2>`;
      } else if (/^-\s+/.test(trimmed)) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${trimmed.replace(/^-\s+/, "")}</li>`;
      } else if (trimmed === "") {
        closeListIfNeeded();
      } else {
        closeListIfNeeded();
        html += `<p>${trimmed}</p>`;
      }
    });

    closeListIfNeeded();
    return html;
  }

  function extractGalleryImages(md) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;

    while ((match = imageRegex.exec(md)) !== null) {
      images.push({
        alt: match[1] ? match[1].trim() : "Imagen del proyecto",
        src: match[2].trim()
      });
    }

    return images;
  }

  function applyHero(md) {
    const headingMatch = md.match(/^#\s+(.+)$/m);
    if (!headingMatch) return;

    const heading = headingMatch[1].trim();
    const [title, ...metaParts] = heading.split(" · ");
    const meta = metaParts.join(" · ");

    const heroTitle = document.querySelector(".project-hero h1");
    const heroMeta = document.querySelector(".project-hero p");

    if (heroTitle) heroTitle.textContent = title || heading;
    if (heroMeta) heroMeta.textContent = meta || heading;
  }

  function renderDescription(md) {
    const descriptionContainer = document.querySelector(".project-description .content");
    if (!descriptionContainer) return;

    const galleryIndex = md.search(/^##\s+Galería\b/m);
    let descriptionMd = galleryIndex !== -1 ? md.slice(0, galleryIndex) : md;
    descriptionMd = descriptionMd.replace(/^#\s+.*$/m, "").trim();

    descriptionContainer.innerHTML = markdownToHtml(descriptionMd);
  }

  function renderGallery(md) {
    const galleryGrid = document.querySelector(".project-gallery .grid");
    if (!galleryGrid) return;

    const images = extractGalleryImages(md);
    galleryGrid.innerHTML = "";

    if (!images.length) {
      galleryGrid.innerHTML = "<p>Galería pendiente de actualización.</p>";
      return;
    }

    images.forEach(({ alt, src }) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt || "Imagen del proyecto";
      galleryGrid.appendChild(img);
    });
  }

  async function loadProjectContent() {
    try {
      const response = await fetch("index.md");
      if (!response.ok) {
        throw new Error(`No se pudo cargar el contenido del proyecto (${response.status})`);
      }

      const md = await response.text();
      applyHero(md);
      renderDescription(md);
      renderGallery(md);
    } catch (error) {
      console.error("Error cargando proyecto:", error);
      const descriptionContainer = document.querySelector(".project-description .content");
      if (descriptionContainer) {
        descriptionContainer.innerHTML = "<p>No se pudo cargar el contenido del proyecto.</p>";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", loadProjectContent);
})();
