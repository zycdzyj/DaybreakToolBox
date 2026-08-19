// 快速列出 app.asar 内的文件路径（解析 asar 的 pickle 头）
const fs = require('fs')

const asarPath = process.argv[2] || 'dist/win-unpacked/resources/app.asar'
const fd = fs.openSync(asarPath, 'r')
const stat = fs.fstatSync(fd)

// 读取前 16MB 的头部数据（asar 文件列表在头部）
const headerSize = Math.min(stat.size, 16 * 1024 * 1024)
const buf = Buffer.alloc(headerSize)
fs.readSync(fd, buf, 0, headerSize, 0)
fs.closeSync(fd)

const s = buf.toString('utf8')

// 提取 renderer/main/preload 下的文件路径
const re = /(?:renderer|main|preload)\/[A-Za-z0-9_\-./\u4e00-\u9fa5]+\.(html|js|css|png|json|ico)/g
const m = s.match(re)

console.log('=== app.asar 内的应用文件 ===')
console.log([...new Set(m || [])].sort().join('\n') || '(没有找到任何文件)')
