// renderer.ts
import type { SearchResult } from '../../preload/index'

// DOM 元素
const inputElement = document.getElementById('search-music') as HTMLInputElement | null
const btnElement = document.getElementById('search_music_btn') as HTMLButtonElement | null

// 定义歌曲数据类型
interface Song {
  id: number
  name: string
  artists: string | string[]
  album: string
  picUrl: string
}

// 事件监听
btnElement?.addEventListener('click', handleSearch)

inputElement?.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleSearch()
  }
})

// API 可用性检查
function isApiAvailable(): boolean {
  return !!(window.api && typeof window.api.searchMusic === 'function')
}

// 搜索处理函数
async function handleSearch() {
  const searchText: string = inputElement?.value?.trim() || ''
  if (!searchText) {
    console.warn('请输入搜索关键词')
    return
  }

  if (!isApiAvailable()) {
    console.error('API 未初始化')
    alert('系统错误，请重启应用')
    return
  }

  // 显示加载状态
  if (btnElement) {
    btnElement.textContent = '搜索中...'
    btnElement.disabled = true
  }

  try {
    // 使用 window.api.searchMusic
    const results = await window.api.searchMusic(searchText)
    console.log('收到搜索结果:', results)

    // ✅ 修正：传入数组，处理数据
    const { names, artists ,ids } = processSearchResults(results)
    console.log(`${names},${artists},${ids}`)
    // ✅ 修正：传入处理好的数据渲染
    renderProcessedResults(names, artists, ids)

    return results
  } catch (error) {
    console.error('搜索失败:', error)
    alert('搜索失败，请重试')
  } finally {
    if (btnElement) {
      btnElement.textContent = '搜索'
      btnElement.disabled = false
    }
  }
}

// ✅ 修正：参数类型改为 Song[]（数组）
function processSearchResults(songs: Song[]): {
  names: string[]
  artists: string[][]
  ids: number[]
} {
  const allNames = songs.map((song) => song.name)
  const allArtists = songs.map((song) => {
    // 处理 artists 可能是字符串或数组
    if (Array.isArray(song.artists)) {
      return song.artists
    } else {
      return song.artists.split('/')
    }
  })
  const allIds = songs.map((song) => song.id)

  return {
    names: allNames,
    artists: allArtists,
    ids: allIds
  }
}

// 渲染函数
// 渲染函数 - 补全版本
function renderProcessedResults(names: string[], artists: string[][]): void {
  const container = document.getElementById('songListContainer')
  const countElement = document.getElementById('songCount')

  if (!container) {
    console.error('❌ 找不到容器 #songListContainer')
    return
  }

  // 空状态判断
  if (!names || !artists || names.length === 0 || artists.length === 0) {
    container.innerHTML = `
      <div class="song-item placeholder-item">
        <span class="song-index">#</span>
        <span class="song-name">暂无歌曲</span>
        <span class="song-artist">-</span>
      </div>
    `
    if (countElement) {
      countElement.textContent = '共 0 首'
    }
    return
  }

  // 清空容器
  container.innerHTML = ''

  // 循环生成歌曲列表
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const artistData = artists[i]
    
    // 处理歌手显示
    let artistDisplay = '-'
    if (Array.isArray(artistData)) {
      artistDisplay = artistData.join(' / ')
    } else if (artistData) {
      artistDisplay = artistData
    }

    // 创建歌曲元素
    const songDiv = document.createElement('div')
    songDiv.className = 'song-item'
    songDiv.setAttribute('data-index', String(i))
    
    songDiv.innerHTML = `
      <span class="song-index">${i + 1}</span>
      <span class="song-name">${name}</span>
      <span class="song-artist">${artistDisplay}</span>
    `
    
    container.appendChild(songDiv)
  }

  // 更新数量
  if (countElement) {
    countElement.textContent = `共 ${names.length} 首`
  }
}