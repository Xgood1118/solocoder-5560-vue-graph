<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Rect } from '@/types'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { useViewport } from '@/composables/useViewport'
import { useSelection } from '@/composables/useSelection'
import { useConnection } from '@/composables/useConnection'
import { getNodeHandles } from '@/utils/svgShapes'
import GridOverlay from './GridOverlay.vue'
import SelectionBox from './SelectionBox.vue'
import MiniMap from './MiniMap.vue'
import NodeRenderer from '../nodes/NodeRenderer.vue'
import GroupRenderer from '../groups/GroupRenderer.vue'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const svgRef = ref<SVGSVGElement | null>(null)
const { onWheel, onCanvasMouseDown } = useViewport(svgRef)
const { handleCanvasClick, handleBoxSelect } = useSelection()
const { isConnecting, connectionStart, connectionEnd, updateConnection, cancelConnection } = useConnection()

const selectionRect = ref<Rect | null>(null)

let boxSelectStartX = 0
let boxSelectStartY = 0
let isBoxSelecting = false

const cursorClass = computed(() => {
  if (uiStore.isPanning) return 'cursor-grabbing'
  if (uiStore.activeTool === 'pan') return 'cursor-grab'
  if (uiStore.activeTool === 'connect') return 'cursor-crosshair'
  return 'cursor-default'
})

const viewportTransform = computed(() => {
  const vp = uiStore.viewport
  return `translate(${vp.x}, ${vp.y}) scale(${vp.zoom})`
})

function screenToCanvas(clientX: number, clientY: number) {
  const vp = uiStore.viewport
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return {
    x: (clientX - rect.left - vp.x) / vp.zoom,
    y: (clientY - rect.top - vp.y) / vp.zoom,
  }
}

function isHitOnElement(event: MouseEvent): boolean {
  const target = event.target as Element | null
  if (!target) return false
  return !!target.closest('[data-node-root], [data-edge-root], [data-group-root]')
}

function onSvgClick(event: MouseEvent) {
  if (isHitOnElement(event)) return
  handleCanvasClick(event)
  uiStore.hideContextMenu()
}

function onSvgDblClick(event: MouseEvent) {
  if (isHitOnElement(event)) return
  const pos = screenToCanvas(event.clientX, event.clientY)
  uiStore.toggleNodeCreatePanel(pos.x, pos.y, event.clientX, event.clientY)
}

function onSvgContextMenu(event: MouseEvent) {
  if (isHitOnElement(event)) return
  event.preventDefault()
  uiStore.showContextMenu(event.clientX, event.clientY, 'canvas', '')
}

function onSvgMouseDown(event: MouseEvent) {
  if (event.button !== 0) return
  if (isHitOnElement(event)) return

  onCanvasMouseDown(event)

  if (uiStore.activeTool === 'select' && !event.shiftKey) {
    isBoxSelecting = true
    const pos = screenToCanvas(event.clientX, event.clientY)
    boxSelectStartX = pos.x
    boxSelectStartY = pos.y
    selectionRect.value = null
  }
}

function onMouseMove(event: MouseEvent) {
  if (isConnecting.value) {
    updateConnection(event)
  }
  if (isBoxSelecting) {
    const pos = screenToCanvas(event.clientX, event.clientY)
    selectionRect.value = {
      x: boxSelectStartX,
      y: boxSelectStartY,
      width: pos.x - boxSelectStartX,
      height: pos.y - boxSelectStartY,
    }
  }
}

function onMouseUp() {
  if (isConnecting.value) {
    cancelConnection()
  }
  if (isBoxSelecting && selectionRect.value) {
    const r = selectionRect.value
    const normalizedRect: Rect = {
      x: Math.min(r.x, r.x + r.width),
      y: Math.min(r.y, r.y + r.height),
      width: Math.abs(r.width),
      height: Math.abs(r.height),
    }
    if (normalizedRect.width > 5 || normalizedRect.height > 5) {
      handleBoxSelect(normalizedRect)
    }
  }
  isBoxSelecting = false
  selectionRect.value = null
}

const connectionLineStart = computed(() => {
  if (!connectionStart.value) return null
  const node = graphStore.getNodeById(connectionStart.value.nodeId)
  if (!node) return null
  const handles = getNodeHandles(node)
  const handle = handles.find(h => h.id === connectionStart.value!.handleId)
  if (!handle) return null
  return { x: node.x + handle.x, y: node.y + handle.y }
})

const isDragOver = ref(false)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false

  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) return

  const pos = screenToCanvas(e.clientX, e.clientY)
  const reader = new FileReader()
  reader.onload = (event) => {
    let svgContent = event.target?.result as string
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgContent, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (svgEl) {
      const width = parseFloat(svgEl.getAttribute('width') || '100')
      const height = parseFloat(svgEl.getAttribute('height') || '100')
      const nodeWidth = Math.max(80, Math.min(200, width + 40))
      const nodeHeight = Math.max(60, Math.min(160, height + 40))

      const innerSvg = svgEl.innerHTML
      const viewBox = svgEl.getAttribute('viewBox')

      graphStore.addNode({
        label: file.name.replace('.svg', ''),
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
        width: nodeWidth,
        height: nodeHeight,
        shape: 'rectangle',
      })

      const lastNode = graphStore.nodes[graphStore.nodes.length - 1]
      if (lastNode) {
        const svgWrapped = `<svg width="${width}" height="${height}" viewBox="${viewBox || `0 0 ${width} ${height}`}" xmlns="http://www.w3.org/2000/svg">${innerSvg}</svg>`
        graphStore.updateNode(lastNode.id, { svgContent: svgWrapped })
      }
    }
  }
  reader.readAsText(file)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <svg
    ref="svgRef"
    class="w-full h-full"
    :class="[cursorClass, { 'drag-over': isDragOver }]"
    :style="{ background: themeStore.themeColors.canvasBg }"
    @click="onSvgClick"
    @dblclick="onSvgDblClick"
    @contextmenu="onSvgContextMenu"
    @wheel.prevent="onWheel"
    @mousedown="onSvgMouseDown"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <g :transform="viewportTransform">
      <GridOverlay />
      <g class="groups-layer">
        <GroupRenderer
          v-for="group in graphStore.groups"
          :key="group.id"
          :group="group"
        />
      </g>
      <g class="edges-layer">
        <slot name="edges" />
      </g>
      <g class="nodes-layer">
        <NodeRenderer
          v-for="node in graphStore.nodes"
          :key="node.id"
          :node="node"
          v-show="!node.groupId || !graphStore.getGroupById(node.groupId)?.collapsed"
        />
      </g>
      <SelectionBox :rect="selectionRect" />
      <line
        v-if="isConnecting && connectionLineStart && connectionEnd"
        :x1="connectionLineStart.x"
        :y1="connectionLineStart.y"
        :x2="connectionEnd.x"
        :y2="connectionEnd.y"
        :stroke="themeStore.themeColors.accent"
        stroke-width="2"
        stroke-dasharray="6 3"
        pointer-events="none"
      />
    </g>
    <rect
      class="canvas-bg"
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="transparent"
      pointer-events="none"
    />
  </svg>
  <MiniMap />
</template>

<style scoped>
.drag-over {
  outline: 2px dashed var(--color-accent);
  outline-offset: -4px;
}
</style>
