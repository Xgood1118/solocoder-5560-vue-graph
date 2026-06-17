<script setup lang="ts">
import type { GraphNode } from '@/types'
import { computed, ref, onMounted, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { useDrag } from '@/composables/useDrag'
import { useSelection } from '@/composables/useSelection'
import { useConnection } from '@/composables/useConnection'
import { getShapePath, getNodeHandles } from '@/utils/svgShapes'
import NodeHandle from './NodeHandle.vue'
import NodeLabel from './NodeLabel.vue'
import NodeTooltip from './NodeTooltip.vue'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps<{
  node: GraphNode
}>()

const uiStore = useUiStore()
const themeStore = useThemeStore()
const { onNodeMouseDown } = useDrag()
const { handleNodeClick } = useSelection()
const { endConnection, isConnecting, connectionStart } = useConnection()

const isSelected = computed(() => uiStore.selectedNodeIds.includes(props.node.id))
const isHovered = computed(() => uiStore.hoveredNodeId === props.node.id)

const shapePath = computed(() => getShapePath(props.node.shape, props.node.width, props.node.height))
const handles = computed(() => getNodeHandles(props.node))

const filterId = computed(() => `selection-glow-${props.node.id}`)
const clipPathId = computed(() => `node-clip-${props.node.id}`)

const iconComponent = computed(() => {
  if (!props.node.iconRef) return null
  const iconName = props.node.iconRef
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  return (LucideIcons as any)[iconName] || null
})

const hasIcon = computed(() => !!props.node.iconRef || !!props.node.svgContent)

const iconSize = computed(() => Math.min(props.node.width * 0.3, props.node.height * 0.5, 32))

const labelOffset = computed(() => {
  if (!hasIcon.value) return 0
  return iconSize.value / 2 + 4
})

function onMouseDown(event: MouseEvent) {
  event.stopPropagation()
  onNodeMouseDown(event, props.node.id)
}

function onClick(event: MouseEvent) {
  event.stopPropagation()
  handleNodeClick(event, props.node.id)
}

function onContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  uiStore.showContextMenu(event.clientX, event.clientY, 'node', props.node.id)
}

function onMouseEnter(event: MouseEvent) {
  event.stopPropagation()
  uiStore.setHoveredNode(props.node.id)
}

function onMouseLeave(event: MouseEvent) {
  event.stopPropagation()
  if (uiStore.hoveredNodeId === props.node.id) {
    uiStore.setHoveredNode(null)
  }
}

function onHandleMouseUp(event: MouseEvent, handleId: string) {
  event.stopPropagation()
  if (isConnecting.value && connectionStart.value) {
    endConnection(props.node.id, handleId)
  }
}
</script>

<template>
  <g
    :transform="`translate(${node.x}, ${node.y})`"
    data-node-root="1"
    class="node-root"
    style="cursor: move"
    @mousedown="onMouseDown"
    @click="onClick"
    @contextmenu="onContextMenu"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <defs>
      <filter :id="filterId" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
        <feFlood :flood-color="themeStore.themeColors.selectionGlow" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath :id="clipPathId">
        <path :d="shapePath" />
      </clipPath>
    </defs>
    <path
      :d="shapePath"
      data-node-path="1"
      :fill="node.style.fillColor"
      :stroke="node.style.strokeColor"
      :stroke-width="node.style.strokeWidth"
      :filter="isSelected ? `url(#${filterId})` : undefined"
      pointer-events="fill"
    />

    <g v-if="hasIcon" :clip-path="`url(#${clipPathId})`" pointer-events="none">
      <foreignObject
        v-if="iconComponent"
        :x="node.width / 2 - iconSize / 2"
        :y="node.height * 0.15"
        :width="iconSize"
        :height="iconSize"
      >
        <div :style="{ width: iconSize + 'px', height: iconSize + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }">
          <component :is="iconComponent" :size="iconSize" :color="node.style.textColor" />
        </div>
      </foreignObject>
      <foreignObject
        v-else-if="node.svgContent"
        :x="node.width * 0.1"
        :y="node.height * 0.1"
        :width="node.width * 0.8"
        :height="node.height * 0.6"
      >
        <div :style="{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', pointerEvents: 'none' }">
          <div v-html="node.svgContent" :style="{ width: '100%', height: '100%' }"></div>
        </div>
      </foreignObject>
    </g>

    <NodeHandle
      v-for="handle in handles"
      :key="handle.id"
      :handle="handle"
      :node-id="node.id"
      @mouseup="($event) => onHandleMouseUp($event, handle.id)"
    />
    <NodeLabel :node="node" :offset-y="hasIcon ? iconSize * 0.4 + 4 : 0" />
    <NodeTooltip :node="node" :visible="isHovered" />
  </g>
</template>
