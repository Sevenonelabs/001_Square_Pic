import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync } from 'fs'

// Dynamically find all HTML files in the root directory
const htmlFiles = readdirSync(__dirname)
  .filter(file => file.endsWith('.html'))
  .reduce((acc, file) => {
    const name = file.replace('.html', '')
    acc[name] = resolve(__dirname, file)
    return acc
  }, {})

export default defineConfig({
  build: {
    rollupOptions: {
      input: htmlFiles,
    },
  },
})
