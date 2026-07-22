// src/main/index.ts
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from 'axios'

// ================== 类型定义 ==================
interface SongInfo {
  id: number
  name: string
  artists: string
  album: string
  picUrl: string
}

// ================== 搜索功能 ==================
async function searchMusic(keywords: string, limit: number = 10): Promise<SongInfo[]> {
  const url = 'https://music.163.com/api/cloudsearch/pc'

  const params = new URLSearchParams({
    s: keywords,
    type: '1',
    limit: limit.toString()
  })

  try {
    const response = await axios.post(url, params.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://music.163.com/',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      withCredentials: true
    })

    const result = response.data
    const songs: SongInfo[] = []

    if (result.result?.songs) {
      for (const item of result.result.songs) {
        songs.push({
          id: item.id,
          name: item.name,
          artists: item.ar.map((a: any) => a.name).join('/'),
          album: item.al.name,
          picUrl: item.al.picUrl
        })
      }
    }

    return songs
  } catch (error) {
    console.error('搜索音乐失败:', error)
    throw error
  }
}

// ================== 注册 IPC 处理器 ==================
// 重要：必须在 app.whenReady() 之前或之后注册，但不能在渲染进程加载之后
function registerIpcHandlers() {
  // 搜索音乐
  ipcMain.handle('search-music', async (event, { keyword }) => {
    console.log('🎵 收到搜索请求，关键词:', keyword)

    if (!keyword || keyword.trim().length === 0) {
      throw new Error('搜索关键词不能为空')
    }

    try {
      const songs = await searchMusic(keyword, 20)
      console.log(`✅ 找到 ${songs.length} 首歌曲`)
      return songs
    } catch (error) {
      console.error('❌ 搜索失败:', error)
      throw error
    }
  })

  // 关闭窗口
  ipcMain.on('close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  console.log('✅ IPC 处理器注册完成')
}

// ================== 创建窗口 ==================
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ================== 注册 IPC 处理器 ==================
// 在 app.whenReady 之前注册
registerIpcHandlers()

// ================== 应用启动 ==================
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})