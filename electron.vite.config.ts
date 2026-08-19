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

function copyRendererIconsPlugin() {
  const src = resolve(__dirname, 'src/renderer/assets/icons')
  const dest = resolve(__dirname, 'out/renderer/assets/icons')
  return {
    name: 'copy-renderer-icons',
    closeBundle() {
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
    plugins: [copyRendererIconsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          netEase: resolve(__dirname, 'src/renderer/NetEase.html'),
          cpuTools: resolve(__dirname, 'src/renderer/CPUTools.html'),
          cryptoPage: resolve(__dirname, 'src/renderer/cryptoPage.html'),
          otherTools: resolve(__dirname, 'src/renderer/otherTools.html'),
          memoryTools: resolve(__dirname, 'src/renderer/memoryTools.html'),
          processorTools: resolve(__dirname, 'src/renderer/processorTools.html'),
          peripheralTools: resolve(__dirname, 'src/renderer/peripheralTools.html'),
          commonTools: resolve(__dirname, 'src/renderer/commonTools.html'),
          graphicsTools: resolve(__dirname, 'src/renderer/graphicsTools.html'),
          monitorTools: resolve(__dirname, 'src/renderer/monitorTools.html'),
          stressTools: resolve(__dirname, 'src/renderer/stressTools.html'),
          diskTools: resolve(__dirname, 'src/renderer/diskTools.html'),
          comprehensiveTools: resolve(__dirname, 'src/renderer/comprehensiveTools.html')
        }
      }
    }
  }
})
