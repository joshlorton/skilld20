import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves this repo at joshlorton.github.io/skilld20/, not
  // at a domain root, so production asset URLs need the repo-name prefix.
  // Dev server keeps the default '/' so `npm run dev` works standalone.
  base: command === 'build' ? '/skilld20/' : '/',
  build: {
    // Keeps generated JS/CSS out of the existing root assets/ folder
    // (which holds hand-placed images) once this is merged into the
    // deployed site tree.
    assetsDir: 'assets/materials',
  },
  server: {
    // In prod this app is built to the repo root, so `data/*.json` is
    // same-origin. In dev, proxy it to the static file server serving
    // the repo root (see .claude/launch.json "skilld20" config).
    proxy: {
      '/data': 'http://localhost:5173',
    },
  },
}))
