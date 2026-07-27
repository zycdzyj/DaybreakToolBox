// renderer.ts
interface Window {
  api: {
    searchMusic: (keyword: string) => Promise<Song[]>
    getMusicByIds: (musicIds: string) => Promise<unknown>
    getMusicLyric: (musicId: string) => Promise<unknown>
    getMusicUrl: (musicId: string, level?: string) => Promise<unknown>
  }
}

interface Song {
  id: number
  name: string
  artists: string | string[]
  album: string
  picUrl: string
}

const inputElement = document.getElementById('search-music') as HTMLInputElement | null
const btnElement = document.getElementById('search_music_btn') as HTMLButtonElement | null
const container = document.getElementById('songListContainer')

let currentResults: Song[] = []
let currentIndex = -1
let isPlaying = false

const audioElement = document.getElementById('music-player') as HTMLAudioElement | null
const playerCoverImg = document.getElementById('player-cover-img') as HTMLImageElement | null
const playerSongName = document.querySelector('.player-song-name') as HTMLElement | null
const playerArtistName = document.querySelector('.player-artist-name') as HTMLElement | null
const playButton = document.querySelector('.play-btn') as HTMLButtonElement | null
const prevButton = document.querySelector('.prev-btn') as HTMLButtonElement | null
const nextButton = document.querySelector('.next-btn') as HTMLButtonElement | null
const progressBar = document.querySelector('.progress-bar') as HTMLElement | null
const progressFill = document.querySelector('.progress-fill') as HTMLElement | null
const currentTimeElement = document.querySelector('.current-time') as HTMLElement | null
const totalTimeElement = document.querySelector('.total-time') as HTMLElement | null

btnElement?.addEventListener('click', handleSearch)

inputElement?.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    void handleSearch()
  }
})

function isApiAvailable(): boolean {
  return !!(
    window.api &&
    typeof window.api.searchMusic === 'function' &&
    typeof window.api.getMusicByIds === 'function' &&
    typeof window.api.getMusicUrl === 'function'
  )
}

async function handleSearch(): Promise<void> {
  const searchText = inputElement?.value?.trim() || ''
  if (!searchText) {
    console.warn('请输入搜索关键词')
    return
  }

  if (!isApiAvailable()) {
    console.error('API 未初始化')
    alert('系统错误，请重启应用')
    return
  }

  if (btnElement) {
    btnElement.textContent = '搜索中...'
    btnElement.disabled = true
  }

  try {
    const results = await window.api.searchMusic(searchText)
    currentResults = results
    console.log('收到搜索结果:', results)

    const { names, artists, ids } = processSearchResults(results)
    renderProcessedResults(names, artists, ids)
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    if (btnElement) {
      btnElement.textContent = '搜索'
      btnElement.disabled = false
    }
  }
}

function processSearchResults(songs: Song[]): {
  names: string[]
  artists: string[][]
  ids: number[]
} {
  const allNames = songs.map((song) => song.name)
  const allArtists = songs.map((song) => {
    if (Array.isArray(song.artists)) {
      return song.artists
    }
    return song.artists.split('/')
  })
  const allIds = songs.map((song) => song.id)

  return {
    names: allNames,
    artists: allArtists,
    ids: allIds
  }
}

function renderProcessedResults(names: string[], artists: string[][], ids: number[]): void {
  const countElement = document.getElementById('songCount')

  if (!container) {
    console.error('❌ 找不到容器 #songListContainer')
    return
  }

  if (!names.length || !artists.length) {
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

  container.innerHTML = ''

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const artistData = artists[i]
    const artistDisplay = Array.isArray(artistData) ? artistData.join(' / ') : artistData || '-'

    const songDiv = document.createElement('div')
    songDiv.className = 'song-item'
    songDiv.setAttribute('data-index', String(i))
    songDiv.setAttribute('data-id', String(ids[i]))
    songDiv.innerHTML = `
      <span class="song-index">${i + 1}</span>
      <span class="song-name">${name}</span>
      <span class="song-artist">${artistDisplay}</span>
    `

    container.appendChild(songDiv)
  }

  if (countElement) {
    countElement.textContent = `共 ${names.length} 首`
  }
}

function outputMusicDetail(detail: unknown): void {
  console.log('🎵 主进程返回的音乐详情:', detail)

  let detailOutputElement = document.getElementById('music-detail-output') as HTMLPreElement | null
  if (!detailOutputElement) {
    detailOutputElement = document.createElement('pre')
    detailOutputElement.id = 'music-detail-output'
    detailOutputElement.style.cssText = 'white-space: pre-wrap; margin-top: 12px; font-size: 12px; max-height: 220px; overflow: auto;'
    document.body.appendChild(detailOutputElement)
  }

  detailOutputElement.textContent = JSON.stringify(detail, null, 2)
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00'
  }

  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function extractAudioUrl(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return null
  }

  const data = (response as { data?: Array<{ url?: string }> }).data
  if (Array.isArray(data) && data.length > 0) {
    return data[0]?.url ?? null
  }

  const songs = (response as { songs?: Array<{ url?: string }> }).songs
  if (Array.isArray(songs) && songs.length > 0) {
    return songs[0]?.url ?? null
  }

  return null
}

function updatePlayButton(): void {
  if (!playButton) return
  playButton.textContent = isPlaying ? '⏸' : '▶'
}

function setActiveSong(index: number): void {
  const previous = container?.querySelector('.song-item.active')
  if (previous) {
    previous.classList.remove('active')
  }

  const next = container?.querySelector(`.song-item[data-index="${index}"]`)
  if (next) {
    next.classList.add('active')
  }
}

function updatePlayerDisplay(song: Song): void {
  if (playerCoverImg) {
    playerCoverImg.src = song.picUrl || ''
    playerCoverImg.style.display = song.picUrl ? 'block' : 'none'
  }

  if (playerSongName) {
    playerSongName.textContent = song.name || '未知歌曲'
  }

  if (playerArtistName) {
    playerArtistName.textContent = Array.isArray(song.artists) ? song.artists.join(' / ') : song.artists
  }
}

function updateProgressUI(current: number, total: number): void {
  if (currentTimeElement) {
    currentTimeElement.textContent = formatTime(current)
  }
  if (totalTimeElement) {
    totalTimeElement.textContent = formatTime(total)
  }
  if (progressFill && total > 0) {
    progressFill.style.width = `${Math.min(100, (current / total) * 100)}%`
  }
}

async function loadAndPlaySong(index: number): Promise<void> {
  if (index < 0 || index >= currentResults.length) {
    return
  }

  const song = currentResults[index]
  currentIndex = index
  setActiveSong(index)
  updatePlayerDisplay(song)

  if (!isApiAvailable()) {
    console.error('API 未初始化')
    alert('无法播放歌曲，请重启应用')
    return
  }

  try {
    const response = await window.api.getMusicUrl(song.id)
    const audioUrl = extractAudioUrl(response)

    if (!audioUrl) {
      throw new Error('未能获取有效播放地址')
    }

    if (!audioElement) {
      throw new Error('播放器未找到')
    }

    audioElement.src = audioUrl
    await audioElement.play()
    isPlaying = true
    updatePlayButton()
  } catch (error) {
    console.error('播放失败:', error)
    
  }
}

function togglePlayPause(): void {
  if (!audioElement) {
    return
  }

  if (audioElement.paused) {
    audioElement.play().catch((error) => console.error('播放失败:', error))
    isPlaying = true
  } else {
    audioElement.pause()
    isPlaying = false
  }

  updatePlayButton()
}

function playPrevious(): void {
  if (currentIndex > 0) {
    void loadAndPlaySong(currentIndex - 1)
  }
}

function playNext(): void {
  if (currentIndex + 1 < currentResults.length) {
    void loadAndPlaySong(currentIndex + 1)
  }
}

if (playButton) {
  playButton.addEventListener('click', () => {
    if (currentIndex < 0) {
      void loadAndPlaySong(0)
    } else {
      togglePlayPause()
    }
  })
}

if (prevButton) {
  prevButton.addEventListener('click', () => {
    playPrevious()
  })
}

if (nextButton) {
  nextButton.addEventListener('click', () => {
    playNext()
  })
}

if (audioElement) {
  audioElement.addEventListener('timeupdate', () => {
    updateProgressUI(audioElement.currentTime, audioElement.duration)
  })

  audioElement.addEventListener('loadedmetadata', () => {
    updateProgressUI(audioElement.currentTime, audioElement.duration)
  })

  audioElement.addEventListener('ended', () => {
    isPlaying = false
    updatePlayButton()
    if (currentIndex + 1 < currentResults.length) {
      void loadAndPlaySong(currentIndex + 1)
    }
  })
}

if (progressBar) {
  progressBar.addEventListener('click', (event) => {
    if (!audioElement || !audioElement.duration || !progressBar) {
      return
    }

    const rect = progressBar.getBoundingClientRect()
    const clickX = (event as MouseEvent).clientX - rect.left
    const ratio = Math.max(0, Math.min(1, clickX / rect.width))
    audioElement.currentTime = ratio * audioElement.duration
  })
}

container?.addEventListener('click', async (event) => {
  const clickedItem = (event.target as Element | null)?.closest('.song-item') as HTMLElement | null
  if (!clickedItem) return

  const indexString = clickedItem.getAttribute('data-index')
  const musicIds = clickedItem.getAttribute('data-id')
  if (!indexString || !musicIds) return

  const index = Number(indexString)
  if (!Number.isFinite(index)) return

  console.log(`点击了歌曲 #${index + 1}, ID: ${musicIds}`)

  await loadAndPlaySong(index)
})
