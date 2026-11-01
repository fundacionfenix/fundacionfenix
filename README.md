# Fundación Fénix Fénix

Sitio institucional de la Fundación Fénix Fénix — https://fundacionfenixfenix.org

Sitio estático (HTML, CSS y un poco de JavaScript), sin dependencias de compilación. Se publica tal cual con GitHub Pages.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `index.html` | Página única: inicio, nosotros, valores, modelo, programas, equipo, apoyo y contacto |
| `styles.css` | Estilos y paleta de marca (rojo, naranja y amarillo del logo) |
| `script.js` | Menú móvil y animaciones de entrada |
| `assets/` | Logo, favicons e imagen para redes sociales |
| `robots.txt`, `sitemap.xml` | SEO básico |
| `CNAME` | Dominio personalizado |

## Ver el sitio en local

```bash
python3 -m http.server 8000
```

Luego abrir http://localhost:8000.

## Agregar imágenes

Colocar los archivos en `assets/` con nombres sin espacios (por ejemplo `equipo-sergio.jpg`) y optimizarlos antes de subirlos.
