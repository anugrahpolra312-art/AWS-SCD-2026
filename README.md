# AWS Student Community Day Ahmedabad 2026

React event website for 12 December 2026 at Aryabhata Auditorium, Silver Oak University. The design uses the supplied event artwork and its cream, navy, and orange palette.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
npm run build
```

The production build is written to `dist/` and can be served by a static host.

- `src/main.jsx` contains the page and its interactions.
- `src/event-data.js` contains the schedule, technical tracks, and photo details.
- `src/styles.css` contains the Tailwind theme and custom styles.
- `src/parallax.js` configures GSAP ScrollTrigger. Motion for React handles entrances and transitions.
- `public/assets/` contains the poster, logos, photos, and locally hosted font.

Decorative motion respects the operating system's reduced-motion setting.

Gallery source: [2025 event report](https://events.vtools.ieee.org/event_media/download/82513).
