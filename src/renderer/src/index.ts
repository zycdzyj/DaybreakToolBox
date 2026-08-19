// index.ts
// 主框架导航栏切换逻辑：通过 iframe 加载各功能页面，切换时淡入淡出

const FADE_MS = 250 // 与 CSS 中的 transition 时长保持一致
const toolboxPages = new Set([
  'otherTools.html',
  'memoryTools.html',
  'processorTools.html',
  'peripheralTools.html',
  'commonTools.html',
  'graphicsTools.html',
  'monitorTools.html',
  'stressTools.html',
  'diskTools.html',
  'comprehensiveTools.html'
])

const frameContainer = document.getElementById('frame-container') as HTMLElement | null
const sidebar = document.querySelector<HTMLElement>('.sidebar')
const navIndicator = document.querySelector<HTMLElement>('.nav-indicator')
const navItems = Array.from(document.querySelectorAll<HTMLElement>('.nav-item'))
const toolboxGroup = document.querySelector<HTMLElement>('.nav-group')

// 记录当前加载的页面，避免重复加载
let currentPage: string | null = null
// 当前 iframe 引用（用于管理）
let currentFrame: HTMLIFrameElement | null = null
// 正在切页时禁止再次触发导航，避免旧 iframe 还没移除时再次切换造成竞态和内存泄露
let isSwitching = false
let ignoreNextNavRequest = false

function setNavEnabled(enabled: boolean): void {
  navItems.forEach((item) => {
    item.style.pointerEvents = enabled ? '' : 'none'
    item.setAttribute('aria-disabled', String(!enabled))
    item.classList.toggle('disabled', !enabled)
  })
}

function updateNavIndicator(target: HTMLElement | null): void {
  if (!navIndicator || !sidebar || !target) {
    return
  }

  const sidebarRect = sidebar.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const offsetY = targetRect.top - sidebarRect.top
  const targetHeight = target.offsetHeight

  navIndicator.style.height = `${targetHeight}px`
  navIndicator.style.transform = `translateY(${offsetY}px)`
}

function setToolboxMenuOpen(open: boolean): void {
  if (!toolboxGroup) {
    return
  }

  toolboxGroup.classList.toggle('open', open)

  const activeTarget = navItems.find((item) => item.classList.contains('active')) ?? null
  if (activeTarget) {
    updateNavIndicator(activeTarget)
  }
}

// 关闭窗口按钮
const windowCloseBtn = document.getElementById('window-close-btn')
windowCloseBtn?.addEventListener('click', () => {
  window.api?.closeWindow?.()
})

/**
 * 创建一个新的 iframe 并挂载到容器
 */
function createFrame(page: string): HTMLIFrameElement {
  const frame = document.createElement('iframe')
  frame.src = page
  frame.setAttribute('data-page', page)
  frame.classList.add('fade-in')
  frame.style.opacity = '0'
  frameContainer?.appendChild(frame)
  return frame
}

/**
 * 淡出当前 iframe，并在动画结束后将其从 DOM 中移除（释放内存）
 */
function fadeOutAndRemove(frame: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    // 移除淡入类，添加淡出类
    frame.classList.remove('fade-in')
    frame.classList.add('fade-out')
    frame.style.opacity = '0'

    // 等待动画结束后移除 DOM
    setTimeout(() => {
      frame.remove()
      resolve()
    }, FADE_MS)
  })
}

/**
 * 淡入新 iframe
 */
function fadeIn(frame: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    // 下一帧再开始淡入，确保样式生效
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        frame.classList.remove('fade-in')
        frame.classList.add('fade-in')
        frame.style.opacity = '1'
        resolve()
      })
    })
  })
}

/**
 * 切换页面
 */
async function switchPage(page: string): Promise<void> {
  if (isSwitching) {
    ignoreNextNavRequest = true
    return
  }

  if (ignoreNextNavRequest) {
    ignoreNextNavRequest = false
    return
  }

  // 相同页面不重复加载
  if (page === currentPage && currentFrame) {
    return
  }

  isSwitching = true
  setNavEnabled(false)

  // 更新导航高亮
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.page === page)
  })

  const selectedItem = navItems.find((item) => item.dataset.page === page) ?? null
  updateNavIndicator(selectedItem)
  setToolboxMenuOpen(toolboxPages.has(page))

  try {
    // 1. 淡出并移除旧的 iframe
    if (currentFrame) {
      const oldFrame = currentFrame
      currentFrame = null
      oldFrame.src = 'about:blank'
      await fadeOutAndRemove(oldFrame)
    }

    // 2. 创建新的 iframe 并淡入
    const newFrame = createFrame(page)
    await fadeIn(newFrame)

    currentFrame = newFrame
    currentPage = page
  } finally {
    isSwitching = false
    setNavEnabled(true)

    if (ignoreNextNavRequest) {
      ignoreNextNavRequest = false
    }
  }
}

/**
 * 初始化：绑定导航点击事件，默认加载第一个页面
 */
function init(): void {
  const toolboxTrigger = document.querySelector<HTMLElement>('.nav-group-trigger')

  toolboxTrigger?.addEventListener('click', (event) => {
    event.stopPropagation()
    if (!toolboxGroup) {
      return
    }

    const isOpen = toolboxGroup.classList.contains('open')
    const isInSubmenuPage = currentPage !== null && toolboxPages.has(currentPage)

    if (isInSubmenuPage && isOpen) {
      return
    }

    toolboxGroup.classList.toggle('open', !isOpen)

    if (!isOpen && isInSubmenuPage) {
      setToolboxMenuOpen(true)
    }
  })

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const page = item.dataset.page
      if (!page) {
        return
      }

      if (item.classList.contains('nav-group-trigger')) {
        return
      }

      if (isSwitching) {
        ignoreNextNavRequest = true
        return
      }

      if (ignoreNextNavRequest) {
        ignoreNextNavRequest = false
        return
      }

      void switchPage(page)
    })
  })

  // 默认加载第一个导航项对应的页面（NetEase.html）
  const defaultItem = navItems[0]
  const defaultPage = defaultItem?.dataset.page || 'NetEase.html'
  setToolboxMenuOpen(false)
  window.addEventListener('resize', () => {
    const activeTarget = navItems.find((item) => item.classList.contains('active')) ?? null
    updateNavIndicator(activeTarget)
  })
  void switchPage(defaultPage)
}

init()
