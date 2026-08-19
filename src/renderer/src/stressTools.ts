import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['FurMark', 'FurMark.exe']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `stressTools/${name}/${file}` }))

renderTools('烤鸡工具', tools)
