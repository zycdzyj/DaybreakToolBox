import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['aida64', 'aida64.exe'], ['hwinfo', 'HWiNFO64.exe'], ['OCCT', 'OCCT.exe'], ['RWEverything', 'Rw.exe'], ['speccy', 'Speccy64.exe'], ['图拉丁硬件检测', '图拉丁硬件检测.exe']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `comprehensiveTools/${name}/${file}` }))

renderTools('综合检测', tools)
