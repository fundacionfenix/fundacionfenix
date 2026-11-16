# Fundación Fénix Fénix

Sitio institucional de la Fundación Fénix Fénix — https://fundacionfenixfenix.org

Sitio estático (HTML, CSS y un poco de JavaScript), sin dependencias de compilación. Se publica tal cual con GitHub Pages.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `index.html` | Página única: inicio, modelo, terapias, nosotros, valores, programas, apoyo y contacto |
| `styles.css` | Estilos y paleta de marca (rojo, naranja y amarillo del logo) |
| `script.js` | Menú móvil y animaciones de entrada |
| `assets/` | Logo, favicons e imagen para redes sociales |
| `assets/img/` | Fotografías optimizadas (WebP, versiones de 640 y 1200 px) que usa la página |
| `assets/source/` | Fotografías originales, de respaldo |
| `robots.txt`, `sitemap.xml` | SEO básico |
| `CNAME` | Dominio personalizado |

## Ver el sitio en local

```bash
python3 -m http.server 8000
```

Luego abrir http://localhost:8000.

## Agregar imágenes

Guardar el original en `assets/source/` (nombre sin espacios ni tildes, por ejemplo `taller-arte.jpg`) y generar las versiones WebP de 640 y 1200 px en `assets/img/` (`taller-arte-640.webp`, `taller-arte-1200.webp`).
