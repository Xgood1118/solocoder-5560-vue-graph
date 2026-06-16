<template>
  <div
    class="fixed left-0 top-10 bottom-0 flex flex-col items-center py-2 gap-0.5 z-30 overflow-y-auto"
    :style="{ width: '48px', backgroundColor: themeColors.toolbarBg, borderRight: `1px solid ${themeColors.panelBorder}` }"
  >
    <button
      v-for="btn in toolButtons"
      :key="btn.tool"
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors relative group"
      :style="{ backgroundColor: activeTool === btn.tool ? themeColors.accent + '33' : 'transparent' }"
      @click="btn.action"
    >
      <component
        :is="btn.icon"
        :size="18"
        :style="{ color: activeTool === btn.tool ? themeColors.accent : themeColors.textSecondary }"
      />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >{{ btn.label }}</span>
    </button>

    <div class="w-7 my-1" :style="{ borderTop: `1px solid ${themeColors.panelBorder}` }" />

    <button
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
      :style="{ opacity: canUndo ? 1 : 0.35 }"
      :disabled="!canUndo"
      @click="historyStore.undo()"
    >
      <Undo2 :size="18" :style="{ color: themeColors.textSecondary }" />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >Undo</span>
    </button>

    <button
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
      :style="{ opacity: canRedo ? 1 : 0.35 }"
      :disabled="!canRedo"
      @click="historyStore.redo()"
    >
      <Redo2 :size="18" :style="{ color: themeColors.textSecondary }" />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >Redo</span>
    </button>

    <div class="w-7 my-1" :style="{ borderTop: `1px solid ${themeColors.panelBorder}` }" />

    <button
      v-for="btn in zoomButtons"
      :key="btn.label"
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
      @click="btn.action"
    >
      <component
        :is="btn.icon"
        :size="18"
        :style="{ color: themeColors.textSecondary }"
      />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >{{ btn.label }}</span>
    </button>

    <div class="w-7 my-1" :style="{ borderTop: `1px solid ${themeColors.panelBorder}` }" />

    <div class="relative">
      <button
        class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
        @click="showLayoutPopup = !showLayoutPopup"
      >
        <LayoutGrid :size="18" :style="{ color: themeColors.textSecondary }" />
        <span
          class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
          :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
        >Auto Layout</span>
      </button>
      <div
        v-if="showLayoutPopup"
        class="absolute left-12 top-0 rounded-md shadow-lg py-1 z-50"
        :style="{ backgroundColor: themeColors.panelBg, border: `1px solid ${themeColors.panelBorder}` }"
      >
        <button
          v-for="layout in layoutOptions"
          :key="layout.value"
          class="flex items-center gap-2 px-3 py-1.5 text-xs w-full text-left transition-colors"
          :style="{ color: themeColors.textPrimary }"
          @mouseenter="($event.target as HTMLElement).style.backgroundColor = themeColors.toolbarHover"
          @mouseleave="($event.target as HTMLElement).style.backgroundColor = 'transparent'"
          @click="applyLayout(layout.value)"
        >{{ layout.label }}</button>
      </div>
    </div>

    <div class="w-7 my-1" :style="{ borderTop: `1px solid ${themeColors.panelBorder}` }" />

    <button
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
      @click="uiStore.showTemplateModal = !uiStore.showTemplateModal"
    >
      <LayoutTemplate :size="18" :style="{ color: themeColors.textSecondary }" />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >Templates</span>
    </button>

    <button
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
      @click="uiStore.showImportModal = !uiStore.showImportModal"
    >
      <Upload :size="18" :style="{ color: themeColors.textSecondary }" />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >Import</span>
    </button>

    <button
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
      @click="uiStore.showExportModal = !uiStore.showExportModal"
    >
      <Download :size="18" :style="{ color: themeColors.textSecondary }" />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >Export</span>
    </button>

    <div class="w-7 my-1" :style="{ borderTop: `1px solid ${themeColors.panelBorder}` }" />

    <button
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
      @click="cycleTheme"
    >
      <Sun v-if="themeStore.currentTheme === 'light'" :size="18" :style="{ color: themeColors.textSecondary }" />
      <Moon v-else :size="18" :style="{ color: themeColors.textSecondary }" />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >Theme</span>
    </button>

    <button
      class="w-9 h-9 flex items-center justify-center rounded-md transition-colors group"
      @click="uiStore.toggleSearch()"
    >
      <Search :size="18" :style="{ color: themeColors.textSecondary }" />
      <span
        class="absolute left-12 whitespace-nowrap text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        :style="{ backgroundColor: themeColors.panelBg, color: themeColors.textPrimary, border: `1px solid ${themeColors.panelBorder}` }"
      >Search</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { LayoutAlgorithm, ThemeName } from '@/types'
import { LAYOUT_LABELS } from '@/types'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { useHistoryStore } from '@/stores/history'
import { useGraphStore } from '@/stores/graph'
import { forceLayout } from '@/layouts/forceLayout'
import { hierarchicalLayout } from '@/layouts/hierarchicalLayout'
import { treeLayout } from '@/layouts/treeLayout'
import { gridLayout } from '@/layouts/gridLayout'
import { circularLayout } from '@/layouts/circularLayout'
import {
  MousePointer,
  Link,
  Hand,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  LayoutGrid,
  LayoutTemplate,
  Upload,
  Download,
  Sun,
  Moon,
  Search,
} from 'lucide-vue-next'

const uiStore = useUiStore()
const themeStore = useThemeStore()
const historyStore = useHistoryStore()

const themeColors = computed(() => themeStore.themeColors)
const activeTool = computed(() => uiStore.activeTool)
const canUndo = computed(() => historyStore.canUndo)
const canRedo = computed(() => historyStore.canRedo)

const toolButtons = computed(() => [
  { tool: 'select', icon: MousePointer, label: 'Select', action: () => uiStore.setActiveTool('select') },
  { tool: 'connect', icon: Link, label: 'Connect', action: () => uiStore.setActiveTool('connect') },
  { tool: 'pan', icon: Hand, label: 'Pan', action: () => uiStore.setActiveTool('pan') },
])

const zoomButtons = [
  { label: 'Zoom In', icon: ZoomIn, action: () => uiStore.zoomIn() },
  { label: 'Zoom Out', icon: ZoomOut, action: () => uiStore.zoomOut() },
  { label: 'Reset View', icon: Maximize, action: () => uiStore.resetViewport() },
]

const layoutOptions = Object.entries(LAYOUT_LABELS).map(([value, label]) => ({
  value: value as LayoutAlgorithm,
  label,
}))

const showLayoutPopup = ref(false)

function applyLayout(algorithm: LayoutAlgorithm) {
  const graphStore = useGraphStore()
  const historyStore = useHistoryStore()
  historyStore.pushHistory('apply-layout')

  let positions: Map<string, { x: number; y: number }>
  const nodes = graphStore.nodes
  const edges = graphStore.edges

  switch (algorithm) {
    case 'force':
      positions = forceLayout(nodes, edges)
      break
    case 'hierarchical':
      positions = hierarchicalLayout(nodes, edges)
      break
    case 'tree':
      positions = treeLayout(nodes, edges)
      break
    case 'grid':
      positions = gridLayout(nodes, edges)
      break
    case 'circular':
      positions = circularLayout(nodes, edges)
      break
    default:
      return
  }

  for (const node of nodes) {
    const pos = positions.get(node.id)
    if (pos) {
      graphStore.updateNode(node.id, { x: pos.x, y: pos.y })
    }
  }

  showLayoutPopup.value = false
}

const themeOrder: ThemeName[] = ['light', 'dark', 'print', 'ocean']

function cycleTheme() {
  const idx = themeOrder.indexOf(themeStore.currentTheme)
  const next = themeOrder[(idx + 1) % themeOrder.length]
  themeStore.setTheme(next)
}

function onClickOutsideLayout(e: MouseEvent) {
  showLayoutPopup.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickOutsideLayout)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutsideLayout)
})
</script>
