// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// 1. 定义安全的 API
const api = {
  // 搜索音乐（使用 invoke，返回 Promise）
  searchMusic: (keyword: string) => {
    return ipcRenderer.invoke('search-music', { keyword })
  },

  // 根据 musicIds 查询歌曲详情、歌词和播放地址
  getMusicByIds: (musicIds: string) => {
    return ipcRenderer.invoke('get-music-by-ids', { musicIds })
  },

  getMusicLyric: (musicId: string) => {
    return ipcRenderer.invoke('get-music-lyric', { musicId })
  },

  getMusicUrl: (musicId: string, level: string = 'sky') => {
    return ipcRenderer.invoke('get-music-url', { musicId, level })
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
      searchMusic: (keyword: string) => Promise<Song[]>
      getMusicByIds: (musicIds: string) => Promise<unknown>
      getMusicLyric: (musicId: string) => Promise<unknown>
      getMusicUrl: (musicId: string, level?: string) => Promise<unknown>
      playMusic: (musicId: number) => Promise<void>
      getMusicList: () => Promise<MusicItem[]>
      closeWindow: () => void
      onSearchProgress: (callback: (data: any) => void) => () => void
    }
  }
}

// 定义类型（方便渲染进程使用）
export interface Song {
  id: number
  name: string
  artists: string | string[]
  album: string
  picUrl: string
}

export interface MusicItem {
  id: number
  title: string
  artist: string
  path: string
  duration: number
}