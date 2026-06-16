<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import type { NodeShape, NodeStyle } from '@/types'
import { NODE_SHAPE_LABELS, DEFAULT_NODE_STYLE } from '@/types'
import { X, Search } from 'lucide-vue-next'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const label = ref('')
const selectedShape = ref<NodeShape>('rectangle')
const selectedColor = ref(DEFAULT_NODE_STYLE.fillColor)
const panelRef = ref<HTMLDivElement | null>(null)

const presetColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316']

const shapes = Object.keys(NODE_SHAPE_LABELS) as NodeShape[]

function close() {
  uiStore.showNodeCreatePanel = false
  label.value = ''
  selectedShape.value = 'rectangle'
  selectedColor.value = DEFAULT_NODE_STYLE.fillColor
}

function create() {
  const style: NodeStyle = {
    ...DEFAULT_NODE_STYLE,
    fillColor: selectedColor.value,
  }
  graphStore.addNode({
    label: label.value || 'Node',
    x: uiStore.nodeCreatePosition.x,
    y: uiStore.nodeCreatePosition.y,
    width: 120,
    height: 60,
    shape: selectedShape.value,
    style,
  })
  close()
}

function onClickOutside(e: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(e.target as Node)) {
    close()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div
    v-if="uiStore.showNodeCreatePanel"
    ref="panelRef"
    class="fixed z-50 rounded-xl shadow-2xl"
    :style="{
      left: uiStore.nodeCreateScreenPosition.x + 'px',
      top: uiStore.nodeCreateScreenPosition.y + 'px',
      background: themeStore.themeColors.panelBg,
      border: `1px solid ${themeStore.themeColors.panelBorder}`,
      width: '260px',
    }"
  >
    <div class="flex items-center justify-between p-3 border-b" :style="{ borderColor: themeStore.themeColors.panelBorder }">
      <span class="text-sm font-medium" :style="{ color: themeStore.themeColors.textPrimary }">新建节点</span>
      <button @click="close" class="p-1 rounded hover:bg-white/10" :style="{ color: themeStore.themeColors.textSecondary }">
        <X :size="16" />
      </button>
    </div>

    <div class="p-3 space-y-3">
      <div class="space-y-1">
        <label class="text-xs" :style="{ color: themeStore.themeColors.textSecondary }">标签</label>
        <input
          v-model="label"
          placeholder="节点名称"
          class="w-full px-2 py-1.5 text-sm rounded border outline-none"
          :style="{ background: themeStore.themeColors.inputBg, borderColor: themeStore.themeColors.inputBorder, color: themeStore.themeColors.textPrimary }"
          @keydown.enter="create"
        />
      </div>

      <div class="space-y-1">
        <label class="text-xs" :style="{ color: themeStore.themeColors.textSecondary }">形状</label>
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="shape in shapes"
            :key="shape"
            @click="selectedShape = shape"
            class="px-2 py-1.5 text-xs rounded border transition-colors"
            :style="{
              background: selectedShape === shape ? themeStore.themeColors.accent + '22' : themeStore.themeColors.inputBg,
              borderColor: selectedShape === shape ? themeStore.themeColors.accent : themeStore.themeColors.inputBorder,
              color: selectedShape === shape ? themeStore.themeColors.accent : themeStore.themeColors.textSecondary,
            }"
          >
            {{ NODE_SHAPE_LABELS[shape] }}
          </button>
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-xs" :style="{ color: themeStore.themeColors.textSecondary }">颜色</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="color in presetColors"
            :key="color"
            @click="selectedColor = color"
            class="w-7 h-7 rounded-md border-2 transition-transform"
            :style="{
              background: color,
              borderColor: selectedColor === color ? themeStore.themeColors.accent : 'transparent',
              transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
            }"
          />
          <label class="w-7 h-7 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer" :style="{ borderColor: themeStore.themeColors.inputBorder }">
            <input type="color" v-model="selectedColor" class="sr-only" />
            <span class="text-xs" :style="{ color: themeStore.themeColors.textSecondary }">+</span>
          </label>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="uiStore.showIconSearch = true"
          class="flex items-center gap-1 px-2 py-1.5 text-xs rounded border"
          :style="{ borderColor: themeStore.themeColors.inputBorder, color: themeStore.themeColors.textSecondary, background: themeStore.themeColors.inputBg }"
        >
          <Search :size="12" /> 图标
        </button>
        <button
          @click="create"
          class="flex-1 py-1.5 text-sm rounded font-medium"
          :style="{ background: themeStore.themeColors.accent, color: '#fff' }"
        >
          创建
        </button>
      </div>
    </div>
  </div>
</template>
