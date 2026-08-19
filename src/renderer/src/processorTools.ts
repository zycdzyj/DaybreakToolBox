import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['CPUZ', 'cpuz64.exe'], ['LinX', 'LinX.exe'], ['Prime95', 'prime95x64.exe'], ['superpi', 'Superpi.exe'], ['ThrottleStop', 'ThrottleStop.exe'], ['wPrime', 'wPrime.exe'], ['XIANGQI', 'xiangqi.exe'], ['线程炸弹', '线程炸弹.zip']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `processorTools/${name}/${file}` }))

renderTools('处理器工具', tools)
