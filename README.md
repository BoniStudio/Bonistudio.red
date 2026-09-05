# BoniStudio.red

The interactive home of BoniStudio, an AI-native studio building products, games, and interactive worlds.

## Experience

The site uses the **Signal Monolith** visual system: editorial typography, a restrained black/ceramic palette, live programmatic canvases, and voltage-lime/ultraviolet signals. Anime.js coordinates the opening sequence, section reveals, scroll-synced systems, and pointer response.

Content is available in English and Simplified Chinese. Language choice persists locally and updates the document language, title, and description.

## Development

```bash
npm install
npm run dev
```

The local site runs at `http://127.0.0.1:5173/`.

```bash
npm run typecheck
npm run build
```

Production output is written to `dist/`.

## Deployment

Pushes to `main` are published through the GitHub Pages workflow in `.github/workflows/deploy.yml`. The custom domain is defined in `public/CNAME`.

## Core structure

```text
src/
  components/
    ExperimentField.tsx
    Header.tsx
    Hero.tsx
    ProjectVisual.tsx
    SignalField.tsx
  hooks/
    useSignalMotion.ts
  i18n/
    content.ts
  styles/
    global.css
    signal.css
  App.tsx
```

The canvases are decorative and automatically reduce activity for compact screens, coarse pointers, hidden tabs, offscreen scenes, and `prefers-reduced-motion`.
