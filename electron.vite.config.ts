import { resolve } from 'path'
import { cpSync, existsSync } from 'fs'
import { defineConfig } from 'electron-vite'

// 自定义插件：构建/开发时把 src/Tools 整体复制到 out/Tools
function copyToolsPlugin() {
  const src = resolve(__dirname, 'src/Tools')
  const dest = resolve(__dirname, 'out/Tools')
  return {
    name: 'copy-tools',
    buildStart() {
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true, force: true })
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [copyToolsPlugin()]
  },
  preload: {},
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          netEase: resolve(__dirname, 'src/renderer/NetEase.html'),
          cpuTools: resolve(__dirname, 'src/renderer/CPUTools.html'),
          cryptoPage: resolve(__dirname, 'src/renderer/cryptoPage.html')
        }
      }
    }
  }
})
