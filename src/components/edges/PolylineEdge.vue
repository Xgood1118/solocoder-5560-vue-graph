<template>
  <path
    :d="pathD"
    :stroke="color"
    :stroke-width="width"
    :stroke-dasharray="dashArray"
    fill="none"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  x1: number
  y1: number
  x2: number
  y2: number
  color?: string
  width?: number
  lineStyle?: 'solid' | 'dashed' | 'dotted'
}>(), {
  color: '#94a3b8',
  width: 2,
  lineStyle: 'solid',
})

const pathD = computed(() => {
  const mx = (props.x1 + props.x2) / 2
  return `M ${props.x1} ${props.y1} L ${mx} ${props.y1} L ${mx} ${props.y2} L ${props.x2} ${props.y2}`
})

const dashArray = computed(() => {
  switch (props.lineStyle) {
    case 'dashed': return '8 4'
    case 'dotted': return '2 4'
    default: return 'none'
  }
})
</script>
