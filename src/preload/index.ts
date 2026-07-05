import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 1. 暴露官方的 electronAPI (包含 process, shell 等)
const api = {
    // 3. 核心修改：将 send 改为 invoke
    sendPing: (message: string) => ipcRenderer.invoke('ping', message),
}

// 3. 将它们安全地暴露给渲染进程
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (兼容 contextIsolation 为 false 的情况)
  window.electron = electronAPI
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api = api
}