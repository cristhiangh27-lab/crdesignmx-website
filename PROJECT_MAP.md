# Project Map

## Estructura del repositorio
- Sitio estático servido desde la raíz con páginas principales (`index.html`, `projects.html`, `services.html`, `about.html`, `contact.html`) y archivos auxiliares como `CNAME` y `README.md`.
- Estilos modernos en `css/styles.css`; se conserva `styles.css` en la raíz para plantillas heredadas dentro de `projects/`.
- JavaScript organizado en `js/` (módulos para carga de proyectos y filtros) y un módulo adicional en la raíz (`project-loader.js`) usado directamente por las páginas.
- Contenido de proyectos bajo `projects/` con un índice (`projects.json`), metadatos (`data.json`), markdown (`index.md`) y HTML por proyecto; algunos HTML de proyectos antiguos siguen su propia maquetación.

## Entradas y navegación
- `index.html` funciona como homepage con hero de video, navegación principal y secciones de proyectos destacados y servicios.
- Las páginas de listado (`projects.html`) y detalle (`projects/<slug>/index.html`) importan el módulo de proyectos para poblar tarjetas, filtros y galerías dinámicas.
- Otras páginas informativas (`services.html`, `about.html`, `contact.html`) reutilizan el mismo header/footer y hoja de estilos principal.

## Rutas y assets
- Videos y logotipos en `img/` (por ejemplo `img/hero/hero-reel.mp4` y `img/brand/logo-cr-collective.png`); imágenes varias adicionales en la misma carpeta.
- Assets específicos de proyectos viven en `projects/<slug>/img/` y se referencian vía rutas relativas calculadas según la página.
- Las portadas declaradas en `projects/*/data.json` pueden usar rutas absolutas (`/img/...`) o relativas, mientras que las galerías en markdown usan rutas relativas al proyecto (`img/*.jpg`).

## JavaScript dinámico
- `js/project-loader.js` define utilidades para cargar el índice (`projects/projects.json`), obtener metadatos de cada proyecto, resolver rutas de assets y renderizar tarjetas, hero y galerías.
- El módulo de filtros (`js/filter.js`) carga todos los proyectos al iniciar `projects.html`, rellena opciones de filtro y renderiza resultados en vivo.
- La homepage importa `renderFeaturedProjects` para mostrar un número limitado de proyectos destacados en la grilla inicial.

## Despliegue en GitHub Pages
- `CNAME` fija el dominio personalizado `crcollective.mx`, indicando que GitHub Pages sirve desde la raíz del repositorio.
- No existe paso de build ni carpeta `docs/`; todas las páginas enlazan CSS/JS y assets directamente, por lo que el sitio se publica tal cual se encuentra en la raíz.
