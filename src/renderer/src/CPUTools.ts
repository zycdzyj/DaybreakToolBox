// 硬件信息分类工具数据

interface HardwareTool {
  name: string
  icon: string
}

const hardwareTools: HardwareTool[] = [
  { name: 'CPU-Z', icon: 'C' },
  { name: 'LinX', icon: 'L' },
  { name: 'Prime95', icon: 'P' },
  { name: 'SuperPI', icon: 'S' },
  { name: 'ThrottleStop', icon: 'T' },
  { name: 'wPrime', icon: 'W' },
  { name: 'XIANGQI', icon: 'X' },
  { name: '线程炸弹', icon: '炸' }
]

// 工具图标颜色映射
const iconColors: Record<string, string> = {
  C: '#4E79A7',
  L: '#F28E2B',
  P: '#59A14F',
  S: '#76B7B2',
  T: '#EDC948',
  W: '#B07AA1',
  X: '#9C755F',
  炸: '#E15759'
}

// 渲染工具网格
function renderTools(): void {
  const grid = document.getElementById('tools-grid') as HTMLElement | null
  if (!grid) return

  grid.innerHTML = ''

  hardwareTools.forEach((tool) => {
    const item = document.createElement('div')
    item.className = 'tool-item'
    item.title = tool.name

    const color = iconColors[tool.icon] || '#4E79A7'

    item.innerHTML = `
      <div class="tool-icon" style="background: ${color}22; color: ${color}; border: 1px solid ${color}44;">
        ${tool.icon}
      </div>
      <div class="tool-name">${tool.name}</div>
    `

    // 双击启动工具
    item.addEventListener('dblclick', () => {
      const statusText = document.getElementById('status-text')
      if (statusText) {
        statusText.textContent = `正在启动: ${tool.name}...`
        window.api.openFile(`${tool.name}`)
        setTimeout(() => {
          statusText.textContent = '就绪'
        }, 2000)
      }
    })

    grid.appendChild(item)
  })

  // 更新标题和计数
  const titleEl = document.getElementById('category-title')
  const countEl = document.getElementById('tool-count')
  if (titleEl) titleEl.textContent = '硬件信息'
  if (countEl) countEl.textContent = `共 ${hardwareTools.length} 个工具`
}

// 初始化渲染
renderTools()
