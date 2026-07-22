// renderer.ts
// 导入 preload 中的类型
import type { SearchResult } from '../../preload/index'

// 不需要重复声明 Window 接口，因为 preload.ts 已经声明了
// 但如果有类型冲突，可以这样扩展

// DOM 元素
const inputElement = document.getElementById('search-music') as HTMLInputElement | null
const btnElement = document.getElementById('search_music_btn') as HTMLButtonElement | null

// 定义歌曲数据类型（根据你的 JSON 结构）
interface Song {
  id: number
  name: string
  artists: string | string[] // 可能是字符串或数组
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
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function handleSearch(){
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
    // 使用 window.api.searchMusic，类型自动推断为 Promise<SearchResult[]>
    const results = await window.api.searchMusic(searchText);
    

    
    console.log('收到搜索结果:', results)
    processSearchResults(results)
    
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

function processSearchResults(songs: unknown): void {
  const allNames = songs.map(song => song.name);
  const allArtists = songs.map(song => song.artists.split('/'));
  const allIds = songs.map(song => song.id);
  console.log(`${allNames},${allArtists},${allIds}`)
}