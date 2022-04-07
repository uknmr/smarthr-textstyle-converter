import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: resolve(__dirname, '..', 'dist'),
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'main.ts'),
      formats: ['es'],
      fileName: 'main'
    }
  }
})
