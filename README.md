# Messi: The Statistical Anomaly

## Live Data Pipeline
- `node scripts/fetch-mvsr-data.js` pulls fresh Messi vs Ronaldo stats from https://www.messivsronaldo.app/ using Gatsby page-data endpoints.
- Output lives in `data/mvsr-data.json` (checked into the repo for offline development). Each run stamps `fetchedAt` so the UI can surface sync time.
- Front-end bindings rely on `[data-stat]` and `[data-stat-cell]` attributes. Update the dataset first, then reload the page to hydrate charts, counters, and tables.

## Front-End Architecture
- `index.html`: single-page flow with hero, thesis, career stats, head-to-head, records, about, and vote sections.
- `css/styles.css`: Argentina-inspired gradients, glass UI, responsive grid, parallax depth classes, and form styling.
- `js/main.js`: smooth scrolling, parallax + particles, animated counters, Chart.js renders, sortable comparison table, GSAP accents, and confetti form feedback.
- Data-driven components: hero stat counters, season gallery cards, career progression chart, radar head-to-head chart, and comparison table all hydrate from `data/mvsr-data.json`.

## Detailed Blueprint# Messi: The Statistical Anomaly — Single Page Blueprint

## Section Flow
1. **Hero / Intro**
   - Full viewport height with layered parallax backgrounds (`hero-bg`, `hero-mid`, `hero-foreground`).
   - Glowing headline with insane display font, looping particle canvas overlay.
   - CTA buttons linking to Career Stats and Vote anchors.
   - Animated stat counters for GA, Goals, Assists, Trophies, Awards summary.

2. **Narrative Thesis**
   - Two-column layout: bold thesis copy + supporting stat chips.
   - Scroll-triggered fade/slide reveals (`data-animate="slide-up"`).
   - Background gradient transition (nav updates active state).

3. **Season Arc / Career Stats**
   - Sticky subheader with filter pills (All / Club / National).
   - Chart.js area+line combo chart placeholder reading from `data/stats.csv` (temp data inline until final CSV).
   - Horizontal scroll gallery of season cards (`.season-track` with parallax drift speeds).

4. **Head-to-Head Spotlight**
   - Toggle buttons for comparison target (default Ronaldo, others disabled for now).
   - Radar chart or dual bar chart via Chart.js; numeric deltas display.
   - Sortable comparison table (vanilla JS) with `IntersectionObserver` triggered reveals.

5. **Records & Highlights**
   - Vertical milestone timeline (left) synced with 3D trophy wall placeholder (center) and highlight video frame (right).
   - Parallax trophies (CSS transform translateZ via perspective container).
   - Video placeholder `<video>` with poster image (to be replaced), optional GSAP ScrollTrigger to play/pause.

6. **About / Data Sources**
   - Glassmorphism cards listing methodology, dataset notes, citations list (anchor links for future URLs).
   - Download button for CSV (placeholder linking to `data/stats.csv`).

7. **Vote & Contact**
   - Multi-field form (Name, Email, Favorite Player dropdown, Why text area, Newsletter checkbox, Age range select).
   - Submit triggers confetti canvas + success message.
   - Footer with social/share icons (placeholder) and top link.

## Visual & Motion System
- **Colors**: Argentina-inspired palette defined as CSS variables:
  - `--celeste: #75bbf4`
  - `--navy: #0e1a33`
  - `--midnight: #050913`
  - `--gold: #f5c451`
  - `--white: #f5f8ff`
  - Gradient combos for backgrounds and buttons.
- **Typography**: Display font via Google Fonts (e.g., `Clash Display` alt fallback `Space Grotesk`), body font `Inter`.
- **Animations**:
  - Parallax using `data-depth` attributes and JS scroll handler.
  - Section reveal utility: `.reveal` class + `IntersectionObserver` toggling `.is-visible`.
  - Smooth anchor scroll with custom easing.
  - Number counter utility for stats.
  - Optional GSAP integration (CDN) for timeline/pin effects; fallback to vanilla if performance dictates.

## Assets & Placeholders
- Hero image placeholder: `/assets/images/hero-placeholder.jpg`.
- Highlight video placeholder: `/assets/video/highlight-placeholder.mp4` + poster.
- Trophy GLB placeholder path (to be determined) with fallback static image.

## Implementation Notes
- Single-page at `index.html`; other HTML files remain for future multi-page expansion, but nav links target anchors (`#career`, `#head-to-head`, etc.).
- `js/main.js` orchestrates parallax, chart setup, counters, intersection reveals, and confetti.
- `css/styles.css` contains CSS variables, global resets, layout grid/flex utilities, section-specific styles, and responsive breakpoints.
- Use semantic HTML5 sections; include ARIA labels for nav/form accessibility.

Next: build the HTML skeleton with placeholder content aligned to this blueprint.

