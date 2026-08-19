import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['HWMonitor', 'HWMonitor_x64.exe'], ['检查更新', '检查更新.bat']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `commonTools/${name}/${file}` }))

renderTools('常用工具', tools)
