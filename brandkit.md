# Ocean-Sense — Brandkit

Identidad visual del proyecto: logo, colores, tipografía, iconografía y fotografía. Todo lo que aparece acá ya está en producción en el sitio (`app/src/app/globals.css`, `app/src/app/layout.tsx`) — no son propuestas, son los valores reales que usa el código.

Para el discurso del proyecto (pitch, problema/solución, cifras, roadmap, bloques de copy), ver [`pitch.md`](./pitch.md) — este archivo es solo identidad visual, no contenido.

---

## 1. Logo

### Concepto
Una boya simplificada sobre dos líneas de ola, construida solo con formas geométricas (círculo, banda, triángulo de bandera) — nada de detalle fino que se pierda en tamaños chicos. No es un ícono genérico de librería: es literalmente el dispositivo que opera la red, reducido a su silueta mínima.

### Archivos (ya en el repo)
| Archivo | Uso |
|---|---|
| `app/public/favicon.svg` | Ícono vectorial — usarlo siempre que se pueda (escala perfecto) |
| `app/public/favicon.ico` / `favicon.png` | Fallback rasterizado 32×32 |
| `app/public/apple-touch-icon.png` | 180×180, para iconos de app / home screen |
| `app/public/logo-512.png` | 512×512 con fondo transparente — el que hay que usar para posts, slides, avatares, OG image |

Para embeber el ícono inline en HTML/React (mismo código que usa el Navbar), el SVG completo está en `app/public/favicon.svg` — es autocontenido, solo requiere los colores del punto 2.

### Uso
- **Fondo**: el logo (`logo-512.png`) tiene fondo transparente — se lee mejor sobre `--background` (#0B132B) o cualquier superficie oscura de la paleta. Evitar ponerlo sobre blanco puro o fondos claros sin probarlo antes (el verde lima y el aqua pierden contraste).
- **Tamaño mínimo**: no bajar de 24px de alto en digital. Por debajo de eso, el detalle de la bandera se pierde — usar solo el círculo/boya si hace falta un ícono más chico.
- **Clear space**: dejar como mínimo el ancho de la boya (el círculo) como margen alrededor en todas direcciones.
- **No hacer**: no recolorear el logo a un solo color plano para "simplificar" (pierde la separación boya/olas), no ponerle sombra o glow que no sea el de la paleta, no estirarlo fuera de proporción 1:1.

---

## 2. Paleta de color

Fuente de verdad: `app/src/app/globals.css`, bloque `:root`. Todos los valores están wireados como custom properties (`var(--nombre)`), no hardcodeados.

| Token | Hex | Rol |
|---|---|---|
| `--background` | `#0B132B` | Fondo base de toda la app — navy casi negro |
| `--surface` | `#1C2541` | Tarjetas, paneles, superficies elevadas |
| `--surface-2` | `#3A506B` | Segundo nivel de elevación (dentro de superficies) |
| `--foreground` | `#D7E4F0` | Texto principal — blanco-azulado suave, **no** el aqua vivo |
| `--muted-foreground` | `#8FA3BC` | Texto secundario / labels / metadata |
| `--accent` | `#5BC0BE` | Verde-agua — botones, interactivo base |
| `--primary` | `#6FFFE9` | Aqua brillante — hover/estado activo, el "brillo" de la marca |
| `--sand` | `#A7C957` | Verde lima — recompensas, valores de cPEN, acento cálido |
| `--alert` | `#c2503a` | Errores, estados críticos (no cambia con el tema) |
| `--border` | `rgba(91,192,190,0.28)` | Bordes translúcidos, tono aqua |

### Regla de oro de la paleta
**El aqua (`--accent`/`--primary`) está reservado para botones y elementos que "brillan"** — CTAs, estado activo del mapa, indicadores "live". El texto de cuerpo usa `--foreground` (blanco-azulado), no el aqua puro — mantiene la lectura calma y reserva el color vivo para lo interactivo. El verde lima (`--sand`) es exclusivamente para valores monetarios/recompensas (cPEN, USDC pendiente) — no mezclarlo con el aqua de botones.

### Para Figma / Canva / Illustrator / slides
Copiar directo estos hex en ese orden de uso: fondo `#0B132B` → superficie `#1C2541` → texto `#D7E4F0` → acento `#5BC0BE` → brillo `#6FFFE9` → recompensas `#A7C957`.

### Gradiente de marca
El degradado usado en títulos y el logo (de `.text-gradient` en globals.css):
```
linear-gradient(135deg, #3A506B 0%, #5BC0BE 40%, #6FFFE9 75%, #D7E4F0 100%)
```
De superficie oscura → aqua → blanco-azulado. Úsalo para el segundo renglón de titulares o para destacar una palabra clave, no para bloques grandes de texto.

---

## 3. Tipografía

Tres familias, cada una con un rol fijo — no mezclar los roles.

| Familia | Rol | Dónde se usa |
|---|---|---|
| **Fraunces** (variable, ejes SOFT/WONK/opsz, itálica incluida) | Display — titulares, números grandes | H1/H2, cifras destacadas (ej. "$0.00", "14"), la palabra itálica de cierre en cada titular |
| **Inter** (300/400/500/600) | Body — texto de lectura, UI | Párrafos, botones, navegación |
| **JetBrains Mono** (400/500) | Data/técnico | Eyebrows ("(03) — The Problem"), coordenadas, timestamps, hashes de transacción, badges |

Fuentes cargadas vía `next/font/google` en `app/src/app/layout.tsx` — no hay archivos de fuente que exportar, son Google Fonts estándar (Fraunces, Inter, JetBrains Mono), instalables igual en Figma/Canva.

### Fórmula de titular (patrón recurrente en todo el sitio)
Dos líneas, la segunda en itálica y color `--accent`:
```
An ocean
*that pays back.*        ← itálica, aqua

Peru's monitoring
*network.*                ← itálica, aqua
```
Reusar esta fórmula para slides/posts: frase neutra + remate corto en itálica/aqua.

### Peso y tracking
- Display: peso 380 (no 400/normal — es intencionalmente más liviano), `letter-spacing: -0.035em` en tamaños grandes.
- Eyebrows/labels: mayúsculas, `letter-spacing: 0.18–0.22em`, siempre en JetBrains Mono.

---

## 4. Voz y tono

### Principios
- **Directo y técnico, sin relleno corporativo.** Nunca "elevate", "seamless", "unleash", "next-gen", "game-changer" ni nada por el estilo.
- **Sin signos de exclamación.** Confianza, no volumen.
- **Cifras concretas, nunca redondeadas de forma sospechosa.** El sitio usa "$3B", "77,326", "3,080 km" — números reales de la fuente (README/pitch.md), no inventados ni "99.9%" genéricos.
- **Sentence case en headlines**, no Title Case.
- **Etiquetas de sección numeradas** — el sitio organiza cada sección como `(0N) — Nombre de sección` en mono. Si armas slides, esta numeración funciona como tabla de contenidos visual.

### Ejemplos reales (copiar el tono, no necesariamente el texto)
- Hero: *"An ocean that pays back."*
- Sección problema: *"Peru's coast is flying blind"*
- Sección cómo funciona: *"Data to rewards in 3 steps"*
- Sección por qué Solana: *"Built for the real world"*
- Footer: *"Built for the Peruvian coast."*
- Error de wallet (creado en la auditoría de accesibilidad): *"Cancelaste la transacción en tu wallet."* — directo, sin "Oops", sin disculpas.
- 404: *"Esta boya no está registrada."* — el error se explica con la metáfora del producto (boya), no con un mensaje genérico.

### Idioma
El producto (UI, copy del sitio) está en **inglés**. El código y algunas páginas nuevas (404, privacy, terms) mezclan labels en español donde el equipo lo decidió — para posts/redes en español, usar el tono de los ejemplos de arriba pero en español, no traducir literal ("An ocean that pays back" → "Un océano que retribuye", no "Un océano que paga de vuelta").

---

## 5. Iconografía

- Librería: **lucide-react** (stroke-based, un solo peso de trazo). No mezclar con otra librería de íconos.
- Tamaño estándar en UI: 14–20px inline, 32–40px para íconos destacados (estados vacíos, headers de sección).
- Evitar los íconos cliché del rubro (cohete para "lanzar", escudo para "seguridad") — el sitio ya usa iconografía más específica: `Waves`, `Radio`, `Thermometer`, `Coins`, `Anchor`-style buoy marker.

---

## 6. Fotografía

Tres imágenes reales en `app/public/`: `hero-ocean.jpg`, `fisher.jpg`, `texture-water.jpg`.

**Dirección de arte:**
- Luz de atardecer/amanecer (dusk/dawn) — nunca luz de mediodía plana.
- Costa Pacífico peruana, agua, siluetas — no gente posando a cámara ni stock genérico "equipo diverso sonriendo".
- Siempre con velo oscuro superpuesto (`rgba(7,13,29, 0.45–0.9)`) para que el texto sea legible encima — nunca foto sin overlay detrás de texto.
- Si se necesita imagen nueva para un post: buscar la misma paridad — costa, pesca artesanal, boyas, agua — con el mismo tratamiento de velo oscuro antes de ponerle texto encima.

---

## 7. Checklist rápido antes de publicar algo

- [ ] ¿Los colores son los del punto 2, no una paleta genérica de plantilla?
- [ ] ¿El aqua brillante (`#6FFFE9`) está solo en acentos/CTAs, no en párrafos completos?
- [ ] ¿El titular sigue la fórmula "frase neutra + remate itálico" si aplica?
- [ ] ¿Cero signos de exclamación, cero "Oops", cero "next-gen/seamless/unleash"?
- [ ] ¿El logo tiene su clear space y no está sobre un fondo donde pierde contraste?
- [ ] Si el material incluye cifras o pitch del proyecto, ¿vienen de [`pitch.md`](./pitch.md), no inventadas al vuelo?
