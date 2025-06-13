import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: '.',
  base: './',
  server: {
    open: true,
    fs: {
      strict: false,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
        },
      },
    },
  },
})
