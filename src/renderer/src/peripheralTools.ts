import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['AresonMouseTest', '鼠标测试软件AresonMouseTestProgram.exe'], ['Keyboard Test Utility', 'Keyboard Test Utility.exe'], ['MOUSERATE', 'MOUSERATE.EXE'], ['鼠标单机变双击测试器', '鼠标单击变双击测试器V2.0.exe']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `peripheralTools/${name}/${file}` }))

renderTools('外设工具', tools)
