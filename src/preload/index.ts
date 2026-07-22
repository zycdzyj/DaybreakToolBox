// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// 1. 定义安全的 API
const api = {
  // 搜索音乐（使用 invoke，返回 Promise）
  searchMusic: (keyword: string) => {
    return ipcRenderer.invoke('search-music', { keyword })
  },

  // 播放音乐
  playMusic: (musicId: number) => {
    return ipcRenderer.invoke('play-music', { musicId })
  },

  // 获取音乐列表
  getMusicList: () => {
    return ipcRenderer.invoke('get-music-list')
  },

  // 单向通信示例：关闭窗口
  closeWindow: () => {
    ipcRenderer.send('close-window')
  },

  // 监听主进程事件（需要清理）
  onSearchProgress: (callback: (data: any) => void) => {
    const listener = (event: any, data: any) => callback(data)
    ipcRenderer.on('search-progress', listener)
    // 返回清理函数
    return () => {
      ipcRenderer.removeListener('search-progress', listener)
    }
  }
}

// 2. 安全暴露 API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose API:', error)
  }
} else {
  // 兼容模式（不推荐）
  ;(window as any).api = api
}

// 3. TypeScript 类型声明
declare global {
  interface Window {
    api: {
      searchMusic: (keyword: string) => Promise<SearchResult[]>
      playMusic: (musicId: number) => Promise<void>
      getMusicList: () => Promise<MusicItem[]>
      closeWindow: () => void
      onSearchProgress: (callback: (data: any) => void) => () => void
    }
  }
}

// 定义类型（方便渲染进程使用）
export interface SearchResult {
  id: number
  title: string
  artist: string
  duration?: number
  cover?: string
}

export interface MusicItem {
  id: number
  title: string
  artist: string
  path: string
  duration: number
}
