// index.ts
// 主框架导航栏切换逻辑：通过 iframe 加载各功能页面，切换时淡入淡出

const FADE_MS = 250 // 与 CSS 中的 transition 时长保持一致
const MENU_TRANSITION_MS = 400 // 与菜单展开/收起动画时长保持一致
const groupPages: Record<string, Set<string>> = {
  utility: new Set(['cryptoPage.html', 'documentTools.html']),
  toolbox: new Set([
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
}

const frameContainer = document.getElementById('frame-container') as HTMLElement | null
const sidebar = document.querySelector<HTMLElement>('.sidebar')
const navIndicator = document.querySelector<HTMLElement>('.nav-indicator')
const navItems = Array.from(document.querySelectorAll<HTMLElement>('.nav-item'))
const navGroups = Array.from(document.querySelectorAll<HTMLElement>('.nav-group'))

// 记录当前加载的页面，避免重复加载
let currentPage: string | null = null
// 当前 iframe 引用（用于管理）
let currentFrame: HTMLIFrameElement | null = null
// 正在切页时禁止再次触发导航，避免旧 iframe 还没移除时再次切换造成竞态和内存泄露
let isSwitching = false
let ignoreNextNavRequest = false
let menuSyncToken = 0

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

function syncNavIndicatorWithMenu(): void {
  const syncToken = ++menuSyncToken
  const startTime = performance.now()

  const sync = (): void => {
    if (syncToken !== menuSyncToken) {
      return
    }

    const activeTarget = navItems.find((item) => item.classList.contains('active')) ?? null
    updateNavIndicator(activeTarget)

    if (performance.now() - startTime < MENU_TRANSITION_MS) {
      requestAnimationFrame(sync)
    }
  }

  requestAnimationFrame(sync)
}

function waitForMenuTransition(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, MENU_TRANSITION_MS)
  })
}

function setGroupMenuOpen(groupName: string, open: boolean, updateIndicator = true): void {
  const group = navGroups.find((item) => item.dataset.group === groupName)
  if (!group) {
    return
  }

  group.classList.toggle('open', open)

  if (updateIndicator) {
    syncNavIndicatorWithMenu()
  }
}

async function prepareMenuForPage(targetGroupName: string | undefined, clickedItem: HTMLElement | null): Promise<void> {
  if (clickedItem?.closest<HTMLElement>('.nav-group.open')) {
    return
  }

  if (targetGroupName && currentPage !== null && groupPages[targetGroupName]?.has(currentPage)) {
    return
  }

  navGroups.forEach((group) => {
    setGroupMenuOpen(group.dataset.group ?? '', false, false)
  })
  await waitForMenuTransition()

  if (targetGroupName) {
    setGroupMenuOpen(targetGroupName, true, false)
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
async function switchPage(page: string, clickedItem: HTMLElement | null = null): Promise<void> {
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

  const targetGroupName = Object.entries(groupPages).find(([, pages]) => pages.has(page))?.[0]
  await prepareMenuForPage(targetGroupName, clickedItem)
  syncNavIndicatorWithMenu()

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
  document.querySelectorAll<HTMLElement>('.nav-group-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation()
      const groupName = trigger.dataset.groupTrigger
      const group = trigger.closest<HTMLElement>('.nav-group')
      if (!group || !groupName) {
        return
      }

      const isOpen = group.classList.contains('open')
      const isInSubmenuPage = currentPage !== null && groupPages[groupName]?.has(currentPage) === true

      if (isInSubmenuPage && isOpen) {
        return
      }

      setGroupMenuOpen(groupName, !isOpen)
    })
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

      void switchPage(page, item)
    })
  })

  // 默认加载第一个导航项对应的页面（NetEase.html）
  const defaultItem = navItems[0]
  const defaultPage = defaultItem?.dataset.page || 'NetEase.html'
  navGroups.forEach((group) => setGroupMenuOpen(group.dataset.group ?? '', false))
  window.addEventListener('resize', () => {
    const activeTarget = navItems.find((item) => item.classList.contains('active')) ?? null
    updateNavIndicator(activeTarget)
  })
  void switchPage(defaultPage)
}

init()
