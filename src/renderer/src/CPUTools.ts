// 硬件信息分类工具数据

interface HardwareTool {
  name: string
  icon: string
}

const hardwareTools: HardwareTool[] = [
  { name: 'CPU-Z', icon: 'C' },
  { name: 'GPU-Z', icon: 'G' },
  { name: 'AIDA64', icon: 'A' },
  { name: 'HWInfo', icon: 'H' },
  { name: 'Speccy', icon: 'S' },
  { name: 'CrystalDiskInfo', icon: 'D' },
  { name: 'HWMonitor', icon: 'M' },
  { name: 'OpenHardwareMonitor', icon: 'O' },
  { name: 'SIW', icon: 'I' },
  { name: 'Everest', icon: 'E' },
  { name: '3DMark', icon: '3' },
  { name: 'HWi64', icon: 'W' }
]

// 工具图标颜色映射
const iconColors: Record<string, string> = {
  C: '#4E79A7',
  G: '#F28E2B',
  A: '#59A14F',
  H: '#E15759',
  S: '#76B7B2',
  D: '#EDC948',
  M: '#B07AA1',
  O: '#9C755F',
  I: '#4E79A7',
  E: '#F28E2B',
  3: '#59A14F',
  W: '#E15759'
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

    // 双击启动（模拟）
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
