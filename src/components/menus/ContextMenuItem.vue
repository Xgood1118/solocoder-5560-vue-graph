<template>
  <button
    class="flex items-center gap-2 px-3 py-1.5 text-xs w-full text-left transition-colors"
    :style="{ color: themeColors.textPrimary }"
    @mouseenter="($event.target as HTMLElement).style.backgroundColor = themeColors.toolbarHover"
    @mouseleave="($event.target as HTMLElement).style.backgroundColor = 'transparent'"
  >
    <component :is="icon" :size="14" :style="{ color: themeColors.textSecondary }" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { useThemeStore } from '@/stores/theme'

defineProps<{
  icon: Component
  label: string
}>()

const themeStore = useThemeStore()
const themeColors = computed(() => themeStore.themeColors)
</script>
