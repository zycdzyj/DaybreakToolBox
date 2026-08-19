import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['AMDGPUClockTool', 'AMDGPUClockTool.exe'], ['DDU v18.0.1.9', 'Display Driver Uninstaller.exe'], ['gpuinfo', 'Gpuinfo.exe'], ['GpuTest_Windows x64', 'GpuTest_GUI.exe'], ['GPUZ', 'GPUZ.exe'], ['nvidiaInspector', 'nvidiaInspector.exe']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `graphicsTools/${name}/${file}` }))

renderTools('显卡工具', tools)
