import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Le DSFR contient des media queries réservées à Internet Explorer (min-width:0\0)
  // que le minificateur refuse : on les ignore.
  css: {
    lightningcss: { errorRecovery: true },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/__version__': 'http://localhost:3000',
    },
  },
})
