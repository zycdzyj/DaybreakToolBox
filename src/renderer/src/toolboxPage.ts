export interface ToolboxTool {
  name: string
  icon: string
  path: string
}

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

export function renderTools(category: string, tools: ToolboxTool[]): void {
  const grid = document.getElementById('tools-grid')
  if (!grid) return

  grid.innerHTML = ''
  tools.forEach((tool) => {
    const item = document.createElement('div')
    item.className = 'tool-item'
    item.title = tool.name
    const color = iconColors[tool.icon] || '#4E79A7'
    item.innerHTML = `<div class="tool-icon" style="background: ${color}22; color: ${color}; border: 1px solid ${color}44;">${tool.icon}</div><div class="tool-name">${tool.name}</div>`
    item.addEventListener('dblclick', () => {
      const statusText = document.getElementById('status-text')
      if (!statusText) return
      statusText.textContent = `正在启动: ${tool.name}...`
      void window.api.openFile(tool.path)
      window.setTimeout(() => {
        statusText.textContent = '就绪'
      }, 2000)
    })
    grid.appendChild(item)
  })

  const title = document.getElementById('category-title')
  const count = document.getElementById('tool-count')
  if (title) title.textContent = category
  if (count) count.textContent = `共 ${tools.length} 个工具`
}
