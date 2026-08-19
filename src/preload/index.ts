// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// 1. 定义安全的 API
const api = {
  // 搜索音乐（使用 invoke，返回 Promise）
  searchMusic: (keyword: string, cookie?: string) => {
    return ipcRenderer.invoke('search-music', { keyword, cookie })
  },

  // 根据 musicIds 查询歌曲详情、歌词和播放地址
  getMusicByIds: (musicIds: string, cookie?: string) => {
    return ipcRenderer.invoke('get-music-by-ids', { musicIds, cookie })
  },

  getMusicLyric: (musicId: string, cookie?: string) => {
    return ipcRenderer.invoke('get-music-lyric', { musicId, cookie })
  },

  getMusicUrl: (musicId: string, level: string = 'sky', cookie?: string) => {
    return ipcRenderer.invoke('get-music-url', { musicId, level, cookie })
  },

  // 下载音乐文件到本地
  downloadMusic: (musicId: number, songName: string, artistName: string, cookie?: string) => {
    return ipcRenderer.invoke('download-music', { musicId, songName, artistName, cookie })
  },
  openFile: (toolName: string) => {
    return ipcRenderer.invoke('open-file', { toolName })
  },
  // 获取分享链接
  getShareUrl: (musicId: number) => {
    return ipcRenderer.invoke('get-share-url', { musicId })
  },

  // Cookie 管理
  setCookie: (cookie: string) => {
    return ipcRenderer.invoke('set-cookie', { cookie })
  },

  getCookie: () => {
    return ipcRenderer.invoke('get-cookie')
  },

  // 关闭窗口
  closeWindow: () => {
    ipcRenderer.send('close')
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
      searchMusic: (keyword: string, cookie?: string) => Promise<Song[]>
      getMusicByIds: (musicIds: string, cookie?: string) => Promise<unknown>
      getMusicLyric: (musicId: string, cookie?: string) => Promise<unknown>
      getMusicUrl: (musicId: string, level?: string, cookie?: string) => Promise<unknown>
      downloadMusic: (musicId: number, songName: string, artistName: string, cookie?: string) => Promise<{ success: boolean; filePath?: string; error?: string }>
      getShareUrl: (musicId: number) => Promise<{ url: string }>
      setCookie: (cookie: string) => Promise<{ success: boolean; masked: string }>
      getCookie: () => Promise<{ cookie: string; masked: string }>
      closeWindow: () => void
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