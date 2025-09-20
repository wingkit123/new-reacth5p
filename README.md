# React H5P Player (Vite + React)

Locally hosts H5P content and renders it via the h5p-standalone runtime in a React + Vite SPA. Includes xAPI progress tracking with `localStorage`, a simple UI badge, and Netlify-ready caching and SPA routing.

## Prerequisites

- Node.js 18+ and npm

## Install, Run, Build

- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build` (copies `h5p-standalone` runtime into `public/assets/h5p-player` via postinstall)
- Preview: `npm run preview`

## H5P Content

- Place H5P packages under `public/h5p/<slug>` with a valid `h5p.json`.
- Configure visible activities in `src/config/h5pActivities.js` (slug, title, summary, optional `embedType: 'iframe' | 'div'`).
- The player runtime is served from `public/assets/h5p-player`.

## xAPI Tracking

- `useXapiTracker` hook listens for H5P xAPI statements and persists coarse progress in `localStorage`.
- UI components display a progress badge per activity.

## Netlify Deployment

- SPA routing: `public/_redirects` → `/* /index.html 200` (bundled into `dist/_redirects`).
- Caching headers: `public/_headers` sets immutable cache for player assets and shorter cache for `/h5p/*` content.
- Deploy the `dist/` folder.

## Notes

- Some complex H5P types render more reliably with `embedType: 'iframe'`.
- If you replace large media, prefer optimized assets. Git LFS is recommended for very large binaries.
