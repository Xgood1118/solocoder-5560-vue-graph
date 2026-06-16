<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useGraphStore } from '@/stores/graph'
import { useThemeStore } from '@/stores/theme'
import { X, Search, ChevronRight } from 'lucide-vue-next'

const uiStore = useUiStore()
const graphStore = useGraphStore()
const themeStore = useThemeStore()

const colors = computed(() => themeStore.themeColors)

const searchQuery = ref('')
const searchInputEl = ref<HTMLInputElement | null>(null)

watch(() => uiStore.searchQuery, (val) => {
  searchQuery.value = val
}, { immediate: true })

function onSearch() {
  uiStore.searchQuery = searchQuery.value
  uiStore.performSearch()
}

function close() {
  uiStore.showSearchBar = false
}

function goToNode(nodeId: string) {
  const node = graphStore.getNodeById(nodeId)
  if (!node) return
  uiStore.selectNode(nodeId)
  const vp = uiStore.viewport
  const targetX = -(node.x * vp.zoom - window.innerWidth / 2 + node.width * vp.zoom / 2)
  const targetY = -(node.y * vp.zoom - window.innerHeight / 2 + node.height * vp.zoom / 2 - 40)
  uiStore.setViewport({ x: targetX, y: targetY, zoom: vp.zoom })
}

const results = computed(() => {
  return uiStore.searchResults.map(id => graphStore.getNodeById(id)).filter(Boolean)
})
</script>

<template>
  <div
    class="fixed top-12 left-1/2 -translate-x-1/2 z-40 w-96 rounded-lg shadow-xl border"
    :style="{ background: colors.panelBg, borderColor: colors.panelBorder }"
  >
    <div class="flex items-center gap-2 p-2 border-b" :style="{ borderColor: colors.panelBorder }">
      <Search :size="16" :style="{ color: colors.textSecondary }" />
      <input
        ref="searchInputEl"
        v-model="searchQuery"
        placeholder="搜索节点标签或属性..."
        class="flex-1 bg-transparent outline-none text-sm"
        :style="{ color: colors.textPrimary }"
        @input="onSearch"
        @keydown.enter="onSearch"
        @keydown.escape="close"
        autofocus
      />
      <button @click="close" class="p-1 rounded hover:bg-white/10" :style="{ color: colors.textSecondary }">
        <X :size="16" />
      </button>
    </div>

    <div v-if="results.length > 0" class="max-h-64 overflow-y-auto py-1">
      <button
        v-for="node in results"
        :key="node!.id"
        @click="goToNode(node!.id)"
        class="flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors"
        :style="{ color: colors.textPrimary }"
        @mouseenter="($event.target as HTMLElement).style.backgroundColor = colors.toolbarHover"
        @mouseleave="($event.target as HTMLElement).style.backgroundColor = 'transparent'"
      >
        <div
          class="w-3 h-3 rounded-sm flex-shrink-0"
          :style="{ background: node!.style.fillColor }"
        />
        <span class="flex-1 truncate">{{ node!.label }}</span>
        <ChevronRight :size="14" :style="{ color: colors.textSecondary }" />
      </button>
    </div>

    <div v-else-if="uiStore.searchQuery" class="p-4 text-center text-sm" :style="{ color: colors.textSecondary }">
      没有找到匹配的节点
    </div>

    <div v-else class="p-4 text-center text-sm" :style="{ color: colors.textSecondary }">
      输入关键词搜索节点
    </div>
  </div>
</template>
