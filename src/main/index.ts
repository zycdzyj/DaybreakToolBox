// src/main/index.ts
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { createCipheriv, createHash } from 'crypto'
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

// ================== Cookie 与加密辅助 ==================
function getMusicCookies(): Record<string, string> {
  return {
    MUSIC_U: '0033A7C2605FEDE9A064B6B8C7F3E5B13708EF294DE512DABE74300EF86EE92A9173CA7669DB914F781C481ADA77E2C4049A0A7FC70BDE38EE8F613929C1C752822B49E50FEC5B939826B32A87AAC0B8EE624D1A00B76FDE1A1FF8121ACEC211B659A57A88314BBDCFB0514DE75AC0FEC9CB8299A88BEDFAE33108C9D9BBFAB15C84C82B7A65D1CEA4AE50F07B39B2B216FFE3B42BDBA570477EB6902B760A54CF912D08752CA18B54F97F0FE8F3DBE69C3BF7C8AEE5EC0115BB18880AAE6438DE2261975C69A43B06F465A0489676FAB59B54EE3E10C629B31980C23585AB95495B8EAD07808C70A7B954AA4944973CB5D4C9F5BEF30740736018AA4901E463E8045960C1EEF7874620D794BE3A65500F5AF8EEF225ADA3C2A3D9C9F5BB4235147F835E198F09F8EBEAD26E8D4A41C6347192A77F74E26BA38F5D4EBD90368A97CFF8FB35AA7DA64C0462FC88C335D09EA9A3CA5325618300A59FDD7A00C045A4E6155BE55525C86803A6F95E2CAEB1AE',
    os: 'pc',
    appver: '8.9.75',
    osver: '',
    deviceId: 'pyncm!'
  }
}

function buildCookieHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
}

function md5Hex(text: string): string {
  return createHash('md5').update(text).digest('hex')
}

function toHex(buffer: Buffer): string {
  return buffer.toString('hex')
}

function pkcs7Pad(data: Buffer, blockSize: number): Buffer {
  const pad = blockSize - (data.length % blockSize)
  return Buffer.concat([data, Buffer.from(Array(pad).fill(pad))])
}

function encryptEapiParams(params: string): string {
  const aesKey = Buffer.from('e82ckenh8dichen8')
  const padded = pkcs7Pad(Buffer.from(params, 'utf8'), aesKey.length)
  const cipher = createCipheriv('aes-128-ecb', aesKey, Buffer.alloc(0))
  cipher.setAutoPadding(false)
  const encrypted = Buffer.concat([cipher.update(padded), cipher.final()])
  return toHex(encrypted)
}

async function postWithCookies(url: string, data: URLSearchParams | Record<string, unknown> | string, cookies: Record<string, string>, extraHeaders: Record<string, string> = {}) {
  const cookieHeader = buildCookieHeader(cookies)

  const requestData = typeof data === 'string' ? data : data

  return axios.post(url, requestData, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://music.163.com/',
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieHeader,
      ...extraHeaders
    }
  })
}

// ================== 搜索功能 ==================
async function searchMusic(keywords: string, limit: number = 10): Promise<SongInfo[]> {
  const url = 'https://music.163.com/api/cloudsearch/pc'
  const cookies = getMusicCookies()

  const params = new URLSearchParams({
    s: keywords,
    type: '1',
    limit: limit.toString()
  })

  try {
    const response = await postWithCookies(url, params.toString(), cookies)

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

async function getSongDetail(musicId: number | string): Promise<unknown> {
  const cookies = getMusicCookies()
  const payload = { c: JSON.stringify([{ id: String(musicId), v: 0 }]) }
  const response = await postWithCookies('https://interface3.music.163.com/api/v3/song/detail', payload, cookies)
  return response.data
}

async function getSongLyric(musicId: number | string): Promise<unknown> {
  const cookies = getMusicCookies()
  const payload = {
    id: String(musicId),
    cp: 'false',
    tv: '0',
    lv: '0',
    rv: '0',
    kv: '0',
    yv: '0',
    ytv: '0',
    yrv: '0'
  }
  const response = await postWithCookies('https://interface3.music.163.com/api/song/lyric', payload, cookies)
  return response.data
}

function extractSongUrl(responseData: unknown): string | null {
  if (!responseData || typeof responseData !== 'object') {
    return null
  }

  const data = (responseData as { data?: Array<{ url?: string }> }).data
  if (Array.isArray(data) && data.length > 0) {
    return data[0]?.url ?? null
  }

  return null
}

async function getSongUrl(musicId: number | string, level: string = 'sky'): Promise<unknown> {
  const cookies = getMusicCookies()
  const url = 'https://interface3.music.163.com/eapi/song/enhance/player/url/v1'
  const config = {
    os: 'pc',
    appver: '8.9.75',
    osver: '',
    deviceId: 'pyncm!',
    requestId: String(Math.floor(Math.random() * 10000000) + 20000000)
  }

  const payload: Record<string, unknown> = {
    ids: [String(musicId)],
    level,
    encodeType: 'aacT',
    header: JSON.stringify(config)
  }

  if (level === 'sky') {
    payload.immerseType = 'c51'
  }

  const urlPath = new URL(url).pathname.replace('/eapi/', '/api/')
  const payloadJson = JSON.stringify(payload)
  const digest = md5Hex(`nobody${urlPath}use${payloadJson}md5forencrypt`)
  const params = `${urlPath}-36cd479b6b5-${payloadJson}-36cd479b6b5-${digest}`
  const encryptedParams = encryptEapiParams(params)

  const response = await postWithCookies(url, { params: encryptedParams }, cookies, {
    'X-Real-IP': '127.0.0.1'
  })

  return response.data
}

// ================== 注册 IPC 处理器 ==================
// 重要：必须在 app.whenReady() 之前或之后注册，但不能在渲染进程加载之后
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function registerIpcHandlers() {
  // 搜索音乐
  ipcMain.handle('search-music', async (_event, { keyword }) => {
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

  // 根据 musicIds 获取歌曲详情、歌词和播放地址
  ipcMain.handle('get-music-by-ids', async (_event, { musicIds }) => {
    console.log('🎵 收到 ID 查询请求:', musicIds)

    if (!musicIds || musicIds.trim().length === 0) {
      throw new Error('musicIds 不能为空')
    }

    try {
      const ids = musicIds.split(',').map((s: string) => s.trim()).filter(Boolean)
      const songs = await Promise.all(
        ids.map(async (id) => {
          const [detail, lyric, urlResponse] = await Promise.all([
            getSongDetail(id),
            getSongLyric(id),
            getSongUrl(id)
          ])

          return {
            id,
            detail,
            lyric,
            url: extractSongUrl(urlResponse)
          }
        })
      )

      console.log('✅ 查询完成')
      return { songs }
    } catch (error) {
      console.error('❌ ID 查询失败:', error)
      throw error
    }
  })

  ipcMain.handle('get-music-lyric', async (_event, { musicId }) => {
    if (!musicId) {
      throw new Error('musicId 不能为空')
    }
    return getSongLyric(musicId)
  })

  ipcMain.handle('get-music-url', async (_event, { musicId, level = 'sky' }) => {
    if (!musicId) {
      throw new Error('musicId 不能为空')
    }
    return getSongUrl(musicId, level)
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
