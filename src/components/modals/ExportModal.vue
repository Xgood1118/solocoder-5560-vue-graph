<script setup lang="ts">
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { X, FileJson, FileCode, FileText, ImageIcon, FileIcon, FileDown } from 'lucide-vue-next'
import jsPDF from 'jspdf'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

function close() {
  uiStore.showExportModal = false
}

function download(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportJSON() {
  const content = JSON.stringify(graphStore.document, null, 2)
  download(`${graphStore.document.name}.json`, content, 'application/json')
  close()
}

function exportSVG() {
  const svgEl = document.querySelector('.absolute.inset-0 svg') as SVGSVGElement | null
  if (!svgEl) return
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl)
  const svgWithXml = `<?xml version="1.0" encoding="UTF-8"?>\n${svgStr}`
  download(`${graphStore.document.name}.svg`, svgWithXml, 'image/svg+xml')
  close()
}

function exportPNG() {
  const svgEl = document.querySelector('.absolute.inset-0 svg') as SVGSVGElement | null
  if (!svgEl) return
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const rect = svgEl.getBoundingClientRect()
  canvas.width = rect.width * 2
  canvas.height = rect.height * 2
  ctx.scale(2, 2)
  const img = new Image()
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  img.onload = () => {
    ctx.drawImage(img, 0, 0, rect.width, rect.height)
    URL.revokeObjectURL(url)
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${graphStore.document.name}.png`
    a.click()
    close()
  }
  img.src = url
}

function exportGraphML() {
  const doc = graphStore.document
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<graphml xmlns="http://graphml.graphstruct.org/xmlns">\n'
  xml += '  <graph id="' + doc.id + '" edgedefault="directed">\n'
  for (const node of doc.nodes) {
    xml += `    <node id="${node.id}">\n`
    xml += `      <data key="label">${escapeXml(node.label)}</data>\n`
    xml += `      <data key="x">${node.x}</data>\n`
    xml += `      <data key="y">${node.y}</data>\n`
    xml += `      <data key="shape">${node.shape}</data>\n`
    xml += `    </node>\n`
  }
  for (const edge of doc.edges) {
    xml += `    <edge source="${edge.sourceId}" target="${edge.targetId}">\n`
    if (edge.label) xml += `      <data key="label">${escapeXml(edge.label)}</data>\n`
    xml += `    </edge>\n`
  }
  xml += '  </graph>\n</graphml>'
  download(`${doc.name}.graphml`, xml, 'application/xml')
  close()
}

function exportDOT() {
  const doc = graphStore.document
  let dot = `digraph "${escapeDot(doc.name)}" {\n`
  for (const node of doc.nodes) {
    dot += `  "${escapeDot(node.label)}" [id="${node.id}", shape=${node.shape}, pos="${node.x},${node.y}"];\n`
  }
  for (const edge of doc.edges) {
    const src = doc.nodes.find(n => n.id === edge.sourceId)
    const tgt = doc.nodes.find(n => n.id === edge.targetId)
    if (src && tgt) {
      const labelPart = edge.label ? ` [label="${escapeDot(edge.label)}"]` : ''
      dot += `  "${escapeDot(src.label)}" -> "${escapeDot(tgt.label)}"${labelPart};\n`
    }
  }
  dot += '}'
  download(`${doc.name}.dot`, dot, 'text/plain')
  close()
}

function exportPDF() {
  const svgEl = document.querySelector('.absolute.inset-0 svg') as SVGSVGElement | null
  if (!svgEl) return
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const rect = svgEl.getBoundingClientRect()
  canvas.width = rect.width * 2
  canvas.height = rect.height * 2
  ctx.scale(2, 2)
  const img = new Image()
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  img.onload = () => {
    ctx.drawImage(img, 0, 0, rect.width, rect.height)
    URL.revokeObjectURL(url)
    const pdf = new jsPDF({ orientation: rect.width > rect.height ? 'landscape' : 'portrait', unit: 'px', format: [rect.width, rect.height] })
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, rect.width, rect.height)
    pdf.save(`${graphStore.document.name}.pdf`)
    close()
  }
  img.src = url
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escapeDot(s: string): string {
  return s.replace(/"/g, '\\"')
}

const formats = [
  { id: 'json', label: 'JSON', icon: FileJson, action: exportJSON },
  { id: 'graphml', label: 'GraphML', icon: FileCode, action: exportGraphML },
  { id: 'dot', label: 'DOT', icon: FileText, action: exportDOT },
  { id: 'png', label: 'PNG', icon: ImageIcon, action: exportPNG },
  { id: 'svg', label: 'SVG', icon: FileIcon, action: exportSVG },
  { id: 'pdf', label: 'PDF', icon: FileDown, action: exportPDF },
]
</script>

<template>
  <div v-if="uiStore.showExportModal" class="modal-overlay" @click.self="close">
    <div class="modal-content" :style="{ background: themeStore.themeColors.panelBg, border: `1px solid ${themeStore.themeColors.panelBorder}` }">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold" :style="{ color: themeStore.themeColors.textPrimary }">导出</h2>
        <button @click="close" class="p-1 rounded hover:bg-white/10" :style="{ color: themeStore.themeColors.textSecondary }">
          <X :size="20" />
        </button>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="fmt in formats"
          :key="fmt.id"
          @click="fmt.action"
          class="flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors"
          :style="{
            background: themeStore.themeColors.inputBg,
            borderColor: themeStore.themeColors.inputBorder,
            color: themeStore.themeColors.textPrimary,
          }"
        >
          <component :is="fmt.icon" :size="24" />
          <span class="text-sm">{{ fmt.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
