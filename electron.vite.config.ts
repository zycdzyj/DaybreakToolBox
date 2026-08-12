import { resolve } from 'path'
import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          hardwareInfo: resolve(__dirname, 'src/renderer/hardwareInfo.html')
        }
      }
    }
  }
})
