import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In prod this app is built to the repo root, so `data/*.json` is
    // same-origin. In dev, proxy it to the static file server serving
    // the repo root (see .claude/launch.json "skilld20" config).
    proxy: {
      '/data': 'http://localhost:5173',
    },
  },
})
