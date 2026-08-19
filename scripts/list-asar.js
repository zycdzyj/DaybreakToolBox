// 用 @electron/asar 库列出 app.asar 内的全部文件
const asar = require('@electron/asar')

const asarPath = process.argv[2] || 'dist/win-unpacked/resources/app.asar'
const files = asar.listPackage(asarPath, { isPack: true })

console.log('=== app.asar 内全部文件 ===')
files.forEach((f) => console.log(f))
