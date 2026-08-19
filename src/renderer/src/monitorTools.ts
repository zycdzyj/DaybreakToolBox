import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['displayx', 'DisplayX.exe'], ['色域检测', 'monitorinfo.exe']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `monitorTools/${name}/${file}` }))

renderTools('显示器工具', tools)
