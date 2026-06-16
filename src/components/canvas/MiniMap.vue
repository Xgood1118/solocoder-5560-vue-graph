<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const miniMapRef = ref<SVGSVGElement | null>(null)

const MAP_WIDTH = 200
const MAP_HEIGHT = 150
const PADDING = 10

const bounds = computed(() => {
  const nodes = graphStore.nodes
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 800 }
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const n of nodes) {
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x + n.width)
    maxY = Math.max(maxY, n.y + n.height)
  }
  const pad = 50
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad }
})

const scale = computed(() => {
  const b = bounds.value
  const worldW = b.maxX - b.minX
  const worldH = b.maxY - b.minY
  const sx = (MAP_WIDTH - PADDING * 2) / worldW
  const sy = (MAP_HEIGHT - PADDING * 2) / worldH
  return Math.min(sx, sy)
})

const offsetX = computed(() => {
  const b = bounds.value
  const worldW = b.maxX - b.minX
  return PADDING + ((MAP_WIDTH - PADDING * 2) - worldW * scale.value) / 2 - b.minX * scale.value
})

const offsetY = computed(() => {
  const b = bounds.value
  const worldH = b.maxY - b.minY
  return PADDING + ((MAP_HEIGHT - PADDING * 2) - worldH * scale.value) / 2 - b.minY * scale.value
})

const viewportRect = computed(() => {
  const vp = uiStore.viewport
  const el = miniMapRef.value
  const svgW = el ? el.clientWidth || MAP_WIDTH : MAP_WIDTH
  const svgH = el ? el.clientHeight || MAP_HEIGHT : MAP_HEIGHT
  const sx = (vp.x / vp.zoom) * scale.value + offsetX.value
  const sy = (vp.y / vp.zoom) * scale.value + offsetY.value
  const sw = (svgW / vp.zoom) * scale.value
  const sh = (svgH / vp.zoom) * scale.value
  return { x: sx, y: sy, width: sw, height: sh }
})

function onClick(event: MouseEvent) {
  const el = miniMapRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const mx = event.clientX - rect.left
  const my = event.clientY - rect.top
  const canvasX = (mx - offsetX.value) / scale.value
  const canvasY = (my - offsetY.value) / scale.value
  const vp = uiStore.viewport
  const svgW = el.clientWidth || MAP_WIDTH
  const svgH = el.clientHeight || MAP_HEIGHT
  uiStore.setViewport({
    x: -(canvasX * vp.zoom - svgW / 2),
    y: -(canvasY * vp.zoom - svgH / 2),
    zoom: vp.zoom,
  })
}
</script>

<template>
  <div
    v-if="uiStore.miniMapOpen"
    class="fixed bottom-4 right-4 rounded-lg border overflow-hidden"
    :style="{
      width: MAP_WIDTH + 'px',
      height: MAP_HEIGHT + 'px',
      background: themeStore.themeColors.miniMapBg,
      borderColor: themeStore.themeColors.panelBorder,
    }"
  >
    <svg
      ref="miniMapRef"
      :width="MAP_WIDTH"
      :height="MAP_HEIGHT"
      class="w-full h-full"
      @click="onClick"
    >
      <rect
        v-for="node in graphStore.nodes"
        :key="node.id"
        :x="node.x * scale + offsetX"
        :y="node.y * scale + offsetY"
        :width="node.width * scale"
        :height="node.height * scale"
        :fill="node.style.fillColor"
        :stroke="node.style.strokeColor"
        stroke-width="0.5"
        rx="1"
      />
      <rect
        :x="viewportRect.x"
        :y="viewportRect.y"
        :width="viewportRect.width"
        :height="viewportRect.height"
        fill="none"
        :stroke="themeStore.themeColors.miniMapViewport"
        stroke-width="2"
        rx="1"
      />
    </svg>
  </div>
</template>
