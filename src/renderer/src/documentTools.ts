type ConversionKey = 'word-pdf' | 'excel-html' | 'pdf-markdown' | 'powerpoint-svg' | 'word-excel'

type ConversionRule = {
  sourceExtensions: string[]
  sourceLabel: string
  targetExtension: string
  targetLabel: string
  icon: string
}

const conversionRules: Record<ConversionKey, ConversionRule> = {
  'word-pdf': { sourceExtensions: ['.doc', '.docx'], sourceLabel: 'Word', targetExtension: '.pdf', targetLabel: 'PDF', icon: 'word-pdf.svg' },
  'excel-html': { sourceExtensions: ['.xls', '.xlsx'], sourceLabel: 'Excel', targetExtension: '.html', targetLabel: 'HTML', icon: 'excel-html.svg' },
  'pdf-markdown': { sourceExtensions: ['.pdf'], sourceLabel: 'PDF', targetExtension: '.md', targetLabel: 'Markdown', icon: 'pdf-markdown.svg' },
  'powerpoint-svg': { sourceExtensions: ['.ppt', '.pptx'], sourceLabel: 'PowerPoint', targetExtension: '.svg', targetLabel: 'SVG', icon: 'powerpoint-svg.svg' },
  'word-excel': { sourceExtensions: ['.doc', '.docx'], sourceLabel: 'Word', targetExtension: '.xlsx', targetLabel: 'Excel', icon: 'word-excel.svg' }
}

const dropZone = document.getElementById('documentDropZone') as HTMLElement
const fileInput = document.getElementById('documentFileInput') as HTMLInputElement
const conversionType = document.getElementById('conversionType') as HTMLSelectElement
const convertButton = document.getElementById('convertDocumentButton') as HTMLButtonElement
const sourceFileIcon = document.getElementById('sourceFileIcon') as HTMLImageElement
const sourceFileName = document.getElementById('sourceFileName') as HTMLElement
const sourceFileHint = document.getElementById('sourceFileHint') as HTMLElement
const resultFileIcon = document.getElementById('resultFileIcon') as HTMLImageElement
const resultFileName = document.getElementById('resultFileName') as HTMLElement
const resultFileHint = document.getElementById('resultFileHint') as HTMLElement
const conversionMessage = document.getElementById('conversionMessage') as HTMLElement
const documentStatus = document.getElementById('documentStatus') as HTMLElement

let selectedFile: File | null = null

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

function getSelectedRule(): ConversionRule {
  return conversionRules[conversionType.value as ConversionKey]
}

function isSupportedFile(file: File, rule: ConversionRule): boolean {
  return rule.sourceExtensions.includes(getExtension(file.name))
}

function showFile(file: File): void {
  selectedFile = file
  sourceFileName.textContent = file.name
  sourceFileHint.textContent = `${getExtension(file).toUpperCase().slice(1) || '未知'} 文件 · 已覆盖导入`
  sourceFileIcon.src = `assets/icons/${getSelectedRule().icon}`
  documentStatus.textContent = '文件已就绪'
  conversionMessage.textContent = '文件格式已读取，请确认转换方式。'
}

function resetResult(): void {
  resultFileIcon.src = 'assets/icons/document-result.svg'
  resultFileName.textContent = '尚无转换结果'
  resultFileHint.textContent = '转换结果将在此显示'
}

function handleFile(file: File | undefined): void {
  if (!file) {
    return
  }

  const rule = getSelectedRule()
  if (!isSupportedFile(file, rule)) {
    selectedFile = null
    documentStatus.textContent = '文件格式不支持'
    conversionMessage.textContent = `当前转换仅支持 ${rule.sourceLabel} 文件，请重新选择。`
    resetResult()
    return
  }

  showFile(file)
}

function openFilePicker(): void {
  fileInput.value = ''
  fileInput.click()
}

dropZone.addEventListener('click', openFilePicker)
dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openFilePicker()
  }
})

fileInput.addEventListener('change', () => handleFile(fileInput.files?.[0]))

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault()
  dropZone.classList.add('is-dragging')
})
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('is-dragging'))
dropZone.addEventListener('drop', (event) => {
  event.preventDefault()
  dropZone.classList.remove('is-dragging')
  handleFile(event.dataTransfer?.files[0])
})

conversionType.addEventListener('change', () => {
  resetResult()
  if (selectedFile) {
    handleFile(selectedFile)
  }
})

convertButton.addEventListener('click', () => {
  const rule = getSelectedRule()
  if (!selectedFile) {
    conversionMessage.textContent = '请先导入文件，再进行转换。'
    return
  }

  if (!isSupportedFile(selectedFile, rule)) {
    conversionMessage.textContent = `无法转换：${selectedFile.name} 不是支持的 ${rule.sourceLabel} 文件。`
    return
  }

  const resultName = `${selectedFile.name.replace(/\.[^.]+$/, '')}${rule.targetExtension}`
  resultFileIcon.src = `assets/icons/${rule.icon}`
  resultFileName.textContent = resultName
  resultFileHint.textContent = `${rule.sourceLabel} → ${rule.targetLabel} · 已生成转换预览`
  conversionMessage.textContent = `${rule.sourceLabel} → ${rule.targetLabel} 格式检查通过，已生成结果预览。`
  documentStatus.textContent = '转换完成'
})
