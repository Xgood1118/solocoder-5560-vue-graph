<template>
  <div
    class="fixed top-0 left-0 right-0 flex items-center px-3 z-30"
    :style="{ height: '40px', backgroundColor: themeColors.toolbarBg, borderBottom: `1px solid ${themeColors.panelBorder}` }"
  >
    <div class="flex items-center gap-2 flex-1">
      <input
        :value="graphStore.document.name"
        class="bg-transparent border-none outline-none text-sm font-medium"
        :style="{ color: themeColors.textPrimary }"
        @change="onNameChange"
      />
    </div>

    <div class="flex items-center justify-center flex-1">
      <span class="text-xs tabular-nums" :style="{ color: themeColors.textSecondary }">
        {{ zoomPercent }}%
      </span>
    </div>

    <div class="flex items-center gap-1 flex-1 justify-end">
      <button
        class="w-7 h-7 flex items-center justify-center rounded transition-colors"
        :style="{ color: themeColors.textSecondary }"
        @click="uiStore.miniMapOpen = !uiStore.miniMapOpen"
      >
        <Map :size="16" />
      </button>
      <button
        class="w-7 h-7 flex items-center justify-center rounded transition-colors"
        :style="{ color: themeColors.textSecondary }"
        @click="uiStore.setPropertyPanelOpen(!uiStore.propertyPanelOpen)"
      >
        <PanelRight :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { Map, PanelRight } from 'lucide-vue-next'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const themeColors = computed(() => themeStore.themeColors)

const zoomPercent = computed(() => Math.round(uiStore.viewport.zoom * 100))

function onNameChange(e: Event) {
  const input = e.target as HTMLInputElement
  graphStore.document.name = input.value
}
</script>
