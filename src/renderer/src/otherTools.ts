import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['BatteryInfoView', 'BatteryInfoView.zip'], ['bluescreenview', 'BlueScreenViewx64.exe'], ['ChipGenius', 'chipgenius.exe'], ['CoreTemp', 'Core Temp x64.exe'], ['Dism++', 'Dism++x64.exe'], ['Everything', 'Everything.exe'], ['Geek Uninstaller', 'Geek Uninstaller.exe'], ['gifcam', 'GifCam.exe'], ['MSIAfterburnerSetup', 'start.bat'], ['oem7', 'oem7.zip'], ['procexp', 'procexp.exe'], ['rufus', 'rufus.exe'], ['ULTRAISO', 'ULTRAISO.exe'], ['ventoy', 'Ventoy2Disk.exe'], ['WinDbg', 'windbg.exe'], ['图拉丁KMS', 'tuladingKMS.exe'], ['Windows10数字权力激活', 'Windows 10 数字永久激活工具 v1.3.4.zip'], ['三星win7激活工具', '三星笔记本win7激活工具.zip'], ['其他win7激活工具', '激活工具.zip']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `otherTools/${name}/${file}` }))

renderTools('其他工具', tools)
