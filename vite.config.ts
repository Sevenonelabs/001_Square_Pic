import { defineConfig } from 'vite'
import { resolve } from 'path'

import { readdirSync } from 'fs'

const htmlFiles = readdirSync(__dirname).filter(f => f.endsWith('.html'))
const entries: Record<string, string> = {}
for (const f of htmlFiles) {
  const name = f.replace(/\.html$/, '').replace(/[-\s]/g, '_')
  entries[name] = resolve(__dirname, f)
}

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: entries,

    },
  },
})
