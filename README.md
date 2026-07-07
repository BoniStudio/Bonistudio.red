# BoniStudio.red

AI-native studio showcase built with React, TypeScript, Vite, React Three Fiber, Three.js, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Vite serves the site at `http://127.0.0.1:5173/` by default.

## Build

```bash
npm run build
```

The production output is written to `dist/`.

## Deploy

### Vercel

1. Import the repository in Vercel.
2. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy.

### GitHub Pages

This project is configured for the custom domain `bonistudio.red`, so Vite keeps `base: "/"`.

```bash
npm run build
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages. The custom domain is declared in `public/CNAME`.

## Project structure

```text
src/
  components/
    Contact.tsx
    HeroParticleScanner.tsx
    InteractiveLab.tsx
    PipelineGraph.tsx
    ProjectCard.tsx
    SectionTitle.tsx
    Timeline.tsx
  constants/
    projects.ts
  styles/
    global.css
  App.tsx
  main.tsx
```

## Visual system

- Hero particle scanner reconstructs an abstract 3D AI core with a moving scan line, additive particles, loading noise, and pointer response.
- Project cards use archive-like metadata, hover scanning, status labels, and accent channels.
- AI Pipeline, Interactive Lab, Timeline, and Contact are componentized for later expansion.
- Mobile view reduces particle count and canvas DPR.
- `prefers-reduced-motion` disables motion-heavy CSS and freezes the 3D scanner into a stable reconstructed state.
