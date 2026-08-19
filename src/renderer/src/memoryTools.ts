import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['memtest', 'memtest.exe'], ['memtest64', 'MemTest64.exe'], ['memtestpro', 'memtestpro.zip'], ['Thaiphoon', 'Thaiphoon.exe'], ['tm5', 'TM5.exe'], ['内存整理', '内存整理.zip'], ['魔方内存盘', 'ramdisk.exe']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `memoryTools/${name}/${file}` }))

renderTools('内存工具', tools)
