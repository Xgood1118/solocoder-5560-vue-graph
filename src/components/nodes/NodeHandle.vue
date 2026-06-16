<script setup lang="ts">
import type { HandlePosition } from '@/types'
import { useThemeStore } from '@/stores/theme'
import { useUiStore } from '@/stores/ui'
import { useConnection } from '@/composables/useConnection'

const props = defineProps<{
  handle: HandlePosition
  nodeId: string
}>()

const themeStore = useThemeStore()
const uiStore = useUiStore()
const { startConnection, isConnecting } = useConnection()

const isHovered = () => uiStore.hoveredNodeId === props.nodeId

function onMouseDown(event: MouseEvent) {
  event.stopPropagation()
  event.preventDefault()
  startConnection(event, props.nodeId, props.handle.id)
}
</script>

<template>
  <circle
    :cx="handle.x"
    :cy="handle.y"
    r="6"
    :fill="themeStore.themeColors.accent"
    :fill-opacity="isHovered() || isConnecting ? 0.8 : 0"
    :stroke="themeStore.themeColors.accent"
    :stroke-opacity="isHovered() || isConnecting ? 1 : 0"
    stroke-width="2"
    style="cursor: crosshair"
    @mousedown="onMouseDown"
  />
</template>
