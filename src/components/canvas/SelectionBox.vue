<script setup lang="ts">
import type { Rect } from '@/types'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{
  rect: Rect | null
}>()

const themeStore = useThemeStore()
</script>

<template>
  <rect
    v-if="rect"
    :x="Math.min(rect.x, rect.x + rect.width)"
    :y="Math.min(rect.y, rect.y + rect.height)"
    :width="Math.abs(rect.width)"
    :height="Math.abs(rect.height)"
    :fill="themeStore.themeColors.selectionGlow"
    :stroke="themeStore.themeColors.accent"
    stroke-width="1"
    stroke-dasharray="4 2"
    pointer-events="none"
  />
</template>
