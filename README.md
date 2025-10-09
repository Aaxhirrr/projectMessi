# Messi: The Statistical Anomaly

- Live github.io site: https://aaxhirrr.github.io/projectMessi/

## Live Data Pipeline
- `node scripts/fetch-mvsr-data.js` pulls fresh Messi vs Ronaldo stats from https://www.messivsronaldo.app/ using Gatsby page-data endpoints.
- Output lives in `data/mvsr-data.json` (checked into the repo for offline development). Each run stamps `fetchedAt` so the UI can surface sync time.
- Front-end bindings rely on `[data-stat]` and `[data-stat-cell]` attributes. Update the dataset first, then reload the page to hydrate charts, counters, and tables.

## Front-End Architecture
- `index.html`: single-page flow with hero, thesis, career stats, head-to-head, records, about, and vote sections.
- `css/styles.css`: Argentina-inspired gradients, glass UI, responsive grid, parallax depth classes, and form styling.
- `js/main.js`: smooth scrolling, parallax + particles, animated counters, Chart.js renders, sortable comparison table, GSAP accents, and confetti form feedback.
- Data-driven components: hero stat counters, season gallery cards, career progression chart, radar head-to-head chart, and comparison table all hydrate from `data/mvsr-data.json`.


- `js/main.js` orchestrates parallax, chart setup, counters, intersection reveals, and confetti.
- `css/styles.css` contains CSS variables, global resets, layout grid/flex utilities, section-specific styles, and responsive breakpoints.
- Use semantic HTML5 sections; include ARIA labels for nav/form accessibility.

Next: build the HTML skeleton with placeholder content aligned to this blueprint.

