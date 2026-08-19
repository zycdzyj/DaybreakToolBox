import { renderTools, type ToolboxTool } from './toolboxPage'

const tools: ToolboxTool[] = [
  ['ASSSDBenchmark', 'ASSSDBenchmark.exe'], ['ATTODISKBENCHMARK', 'ATTO 磁盘基准测试.exe'], ['CrystalDiskInfo', 'DiskInfo64.exe'], ['CrystalDiskMark', 'DiskMarkx64.exe'], ['Defraggler', 'Defraggler.exe'], ['DiskGenius', 'DiskGenius.exe'], ['finaldata', 'FINALDATA.exe'], ['H2testw', 'h2testw_1.4.exe'], ['HDTune', 'HDTune.exe'], ['LLFTOOL', 'LLFTOOL.exe'], ['mydisktest', 'MyDiskTest_v298.exe'], ['SpaceSniffer', 'SpaceSniffer.exe'], ['ssdlife', 'ssdlife.exe'], ['SSDZ', 'SSDZ.exe'], ['URWTEST', 'urwtest_v18.exe'], ['windirstat', 'windirstat.exe'], ['魔方数据恢复', '魔方数据恢复.exe']
].map(([name, file]) => ({ name, icon: name.slice(0, 1), path: `diskTools/${name}/${file}` }))

renderTools('硬盘工具', tools)
