<template>
  <g
    class="edge-renderer"
    @click.stop="onClick"
    @dblclick.stop="onDblClick"
    @contextmenu.prevent.stop="onContextMenu"
  >
    <path
      :d="hitPathD"
      stroke="transparent"
      stroke-width="14"
      fill="none"
      style="cursor: pointer"
    />
    <StraightEdge
      v-if="edge.style.curvature === 'straight'"
      :x1="startX" :y1="startY" :x2="endX" :y2="endY"
      :color="edgeColor" :width="edgeWidth" :line-style="edge.style.lineStyle"
    />
    <ArcEdge
      v-else-if="edge.style.curvature === 'arc'"
      :x1="startX" :y1="startY" :x2="endX" :y2="endY"
      :color="edgeColor" :width="edgeWidth" :line-style="edge.style.lineStyle"
    />
    <PolylineEdge
      v-else-if="edge.style.curvature === 'polyline'"
      :x1="startX" :y1="startY" :x2="endX" :y2="endY"
      :color="edgeColor" :width="edgeWidth" :line-style="edge.style.lineStyle"
    />
    <EdgeArrow
      v-if="edge.style.arrowDirection === 'unidirectional' || edge.style.arrowDirection === 'bidirectional'"
      :x="endX" :y="endY" :angle="endAngle" :color="edgeColor"
    />
    <EdgeArrow
      v-if="edge.style.arrowDirection === 'bidirectional'"
      :x="startX" :y="startY" :angle="startAngle" :color="edgeColor"
    />
    <EdgeLabel
      v-if="edge.label"
      :x="midX" :y="midY" :label="edge.label" :edge-id="edge.id"
      @edit-label="onEditLabel"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GraphEdge } from '@/types'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { getNodeHandles } from '@/utils/svgShapes'
import StraightEdge from './StraightEdge.vue'
import ArcEdge from './ArcEdge.vue'
import PolylineEdge from './PolylineEdge.vue'
import EdgeArrow from './EdgeArrow.vue'
import EdgeLabel from './EdgeLabel.vue'

const props = defineProps<{
  edge: GraphEdge
}>()

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const sourceNode = computed(() => graphStore.getNodeById(props.edge.sourceId))
const targetNode = computed(() => graphStore.getNodeById(props.edge.targetId))

const sourceHandles = computed(() => sourceNode.value ? getNodeHandles(sourceNode.value) : [])
const targetHandles = computed(() => targetNode.value ? getNodeHandles(targetNode.value) : [])

const sourceHandle = computed(() => {
  if (!props.edge.sourceHandle) return null
  return sourceHandles.value.find(h => h.id === props.edge.sourceHandle) ?? null
})

const targetHandle = computed(() => {
  if (!props.edge.targetHandle) return null
  return targetHandles.value.find(h => h.id === props.edge.targetHandle) ?? null
})

const startX = computed(() => {
  if (sourceHandle.value) return sourceNode.value!.x + sourceHandle.value.x
  return sourceNode.value ? sourceNode.value.x + sourceNode.value.width / 2 : 0
})

const startY = computed(() => {
  if (sourceHandle.value) return sourceNode.value!.y + sourceHandle.value.y
  return sourceNode.value ? sourceNode.value.y + sourceNode.value.height / 2 : 0
})

const endX = computed(() => {
  if (targetHandle.value) return targetNode.value!.x + targetHandle.value.x
  return targetNode.value ? targetNode.value.x + targetNode.value.width / 2 : 0
})

const endY = computed(() => {
  if (targetHandle.value) return targetNode.value!.y + targetHandle.value.y
  return targetNode.value ? targetNode.value.y + targetNode.value.height / 2 : 0
})

const midX = computed(() => (startX.value + endX.value) / 2)
const midY = computed(() => (startY.value + endY.value) / 2)

const isSelected = computed(() => uiStore.selectedEdgeIds.includes(props.edge.id))

const edgeColor = computed(() => {
  if (isSelected.value) return themeStore.themeColors.accent
  return props.edge.style.lineColor
})

const edgeWidth = computed(() => isSelected.value ? props.edge.style.lineWidth + 1 : props.edge.style.lineWidth)

const endAngle = computed(() => Math.atan2(endY.value - startY.value, endX.value - startX.value))
const startAngle = computed(() => Math.atan2(startY.value - endY.value, startX.value - endX.value))

const hitPathD = computed(() => {
  if (props.edge.style.curvature === 'polyline') {
    const mx = (startX.value + endX.value) / 2
    return `M ${startX.value} ${startY.value} L ${mx} ${startY.value} L ${mx} ${endY.value} L ${endX.value} ${endY.value}`
  }
  return `M ${startX.value} ${startY.value} L ${endX.value} ${endY.value}`
})

function onClick() {
  uiStore.selectEdge(props.edge.id)
}

function onDblClick() {
  const newLabel = window.prompt('Edge label:', props.edge.label || '')
  if (newLabel !== null) {
    graphStore.updateEdge(props.edge.id, { label: newLabel })
  }
}

function onContextMenu(e: MouseEvent) {
  uiStore.showContextMenu(e.clientX, e.clientY, 'edge', props.edge.id)
}

function onEditLabel(edgeId: string) {
  const newLabel = window.prompt('Edge label:', props.edge.label || '')
  if (newLabel !== null) {
    graphStore.updateEdge(edgeId, { label: newLabel })
  }
}
</script>
