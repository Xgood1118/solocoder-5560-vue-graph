<script setup lang="ts">
import type { GraphNode } from '@/types'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{
  node: GraphNode
  visible: boolean
}>()

const themeStore = useThemeStore()

const dataEntries = computed(() => Object.entries(props.node.data).slice(0, 4))

const tooltipY = computed(() => -10)
</script>

<template>
  <g v-if="visible">
    <rect
      :x="-20"
      :y="tooltipY - 50"
      :width="180"
      :height="50 + dataEntries.length * 18"
      rx="4"
      :fill="themeStore.themeColors.panelBg"
      :stroke="themeStore.themeColors.panelBorder"
      fill-opacity="0.95"
      pointer-events="none"
    />
    <text
      :x="-10"
      :y="tooltipY - 32"
      :fill="themeStore.themeColors.textPrimary"
      font-size="12"
      font-weight="bold"
      pointer-events="none"
    >{{ node.label }}</text>
    <text
      v-for="([key, value], index) in dataEntries"
      :key="key"
      :x="-10"
      :y="tooltipY - 14 + index * 18"
      :fill="themeStore.themeColors.textSecondary"
      font-size="10"
      pointer-events="none"
    >{{ key }}: {{ value }}</text>
  </g>
</template>
