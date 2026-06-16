<script setup lang="ts">
import { ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import type { GraphDocument, GraphNode, GraphEdge, EdgeStyle } from '@/types'
import { DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE } from '@/types'
import { X, Upload } from 'lucide-vue-next'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const dragOver = ref(false)
const error = ref('')

function close() {
  uiStore.showImportModal = false
  error.value = ''
}

function parseJSON(content: string): GraphDocument | null {
  const data = JSON.parse(content)
  if (data.nodes && data.edges) return data as GraphDocument
  return null
}

function parseGraphML(content: string): GraphDocument | null {
  const parser = new DOMParser()
  const xml = parser.parseFromString(content, 'application/xml')
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeElements = xml.querySelectorAll('node')
  nodeElements.forEach((el, i) => {
    const id = el.getAttribute('id') || `n_${i}`
    const labelEl = el.querySelector('data[key="label"]')
    const xEl = el.querySelector('data[key="x"]')
    const yEl = el.querySelector('data[key="y"]')
    const shapeEl = el.querySelector('data[key="shape"]')
    nodes.push({
      id,
      label: labelEl?.textContent || id,
      x: Number(xEl?.textContent) || i * 160,
      y: Number(yEl?.textContent) || 0,
      width: 120,
      height: 60,
      shape: (shapeEl?.textContent as GraphNode['shape']) || 'rectangle',
      style: { ...DEFAULT_NODE_STYLE },
      data: {},
      zIndex: i,
    })
  })
  const edgeElements = xml.querySelectorAll('edge')
  edgeElements.forEach((el, i) => {
    const sourceId = el.getAttribute('source') || ''
    const targetId = el.getAttribute('target') || ''
    const labelEl = el.querySelector('data[key="label"]')
    edges.push({
      id: `e_${i}`,
      sourceId,
      targetId,
      label: labelEl?.textContent || undefined,
      style: { ...DEFAULT_EDGE_STYLE },
    })
  })
  return {
    id: 'doc_' + Date.now(),
    name: 'Imported GraphML',
    nodes,
    edges,
    groups: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function parseDOT(content: string): GraphDocument | null {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeMap = new Map<string, string>()
  let nodeIndex = 0

  const edgeRegex = /"([^"]+)"\s*->\s*"([^"]+)"/g
  const nodeRegex = /"([^"]+)"\s*\[([^\]]+)\]/g

  let match: RegExpExecArray | null
  while ((match = nodeRegex.exec(content)) !== null) {
    const label = match[1]
    const attrs = match[2]
    const idMatch = attrs.match(/id="([^"]+)"/)
    const posMatch = attrs.match(/pos="([^,]+),([^"]+)"/)
    const shapeMatch = attrs.match(/shape=(\w+)/)
    const id = idMatch?.[1] || `n_${nodeIndex}`
    nodeMap.set(label, id)
    nodes.push({
      id,
      label,
      x: posMatch ? Number(posMatch[1]) : nodeIndex * 160,
      y: posMatch ? Number(posMatch[2]) : 0,
      width: 120,
      height: 60,
      shape: (shapeMatch?.[1] as GraphNode['shape']) || 'rectangle',
      style: { ...DEFAULT_NODE_STYLE },
      data: {},
      zIndex: nodeIndex,
    })
    nodeIndex++
  }

  edgeRegex.lastIndex = 0
  let edgeIndex = 0
  while ((match = edgeRegex.exec(content)) !== null) {
    const srcLabel = match[1]
    const tgtLabel = match[2]
    const srcId = nodeMap.get(srcLabel) || srcLabel
    const tgtId = nodeMap.get(tgtLabel) || tgtLabel
    edges.push({
      id: `e_${edgeIndex}`,
      sourceId: srcId,
      targetId: tgtId,
      style: { ...DEFAULT_EDGE_STYLE },
    })
    edgeIndex++
  }

  if (nodes.length === 0) return null
  return {
    id: 'doc_' + Date.now(),
    name: 'Imported DOT',
    nodes,
    edges,
    groups: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

async function handleFile(file: File) {
  error.value = ''
  const content = await file.text()
  const ext = file.name.split('.').pop()?.toLowerCase()
  let doc: GraphDocument | null = null

  try {
    if (ext === 'json') {
      doc = parseJSON(content)
    } else if (ext === 'graphml') {
      doc = parseGraphML(content)
    } else if (ext === 'dot') {
      doc = parseDOT(content)
    } else {
      try {
        doc = parseJSON(content)
      } catch {
        doc = parseGraphML(content)
      }
    }

    if (doc) {
      graphStore.setDocument(doc)
      close()
    } else {
      error.value = '无法解析文件'
    }
  } catch (e) {
    error.value = '解析失败: ' + (e instanceof Error ? e.message : String(e))
  }
}

function onFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) handleFile(target.files[0])
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}
</script>

<template>
  <div v-if="uiStore.showImportModal" class="modal-overlay" @click.self="close">
    <div class="modal-content" :style="{ background: themeStore.themeColors.panelBg, border: `1px solid ${themeStore.themeColors.panelBorder}` }">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold" :style="{ color: themeStore.themeColors.textPrimary }">导入</h2>
        <button @click="close" class="p-1 rounded hover:bg-white/10" :style="{ color: themeStore.themeColors.textSecondary }">
          <X :size="20" />
        </button>
      </div>

      <div
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="onDrop"
        class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
        :style="{
          borderColor: dragOver ? themeStore.themeColors.accent : themeStore.themeColors.inputBorder,
          background: dragOver ? themeStore.themeColors.accent + '11' : themeStore.themeColors.inputBg,
        }"
      >
        <Upload :size="32" class="mx-auto mb-2" :style="{ color: themeStore.themeColors.textSecondary }" />
        <div class="text-sm mb-2" :style="{ color: themeStore.themeColors.textPrimary }">拖拽文件到此处</div>
        <div class="text-xs mb-3" :style="{ color: themeStore.themeColors.textSecondary }">支持 JSON, GraphML, DOT 格式</div>
        <label
          class="inline-block px-4 py-1.5 text-sm rounded cursor-pointer"
          :style="{ background: themeStore.themeColors.accent, color: '#fff' }"
        >
          选择文件
          <input type="file" accept=".json,.graphml,.dot" class="sr-only" @change="onFileInput" />
        </label>
      </div>

      <div v-if="error" class="mt-3 text-sm" :style="{ color: themeStore.themeColors.danger }">{{ error }}</div>
    </div>
  </div>
</template>
