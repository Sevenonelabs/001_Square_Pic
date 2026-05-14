import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        about:   resolve(__dirname, 'about.html'),
        faq:     resolve(__dirname, 'faq.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        support: resolve(__dirname, 'support.html'),
        terms:   resolve(__dirname, 'terms.html'),
      },
    },
  },
})
