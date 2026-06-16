<template>
  <path
    :d="`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`"
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
  curvatureOffset?: number
}>(), {
  color: '#94a3b8',
  width: 2,
  lineStyle: 'solid',
  curvatureOffset: 40,
})

const cx = computed(() => {
  const mx = (props.x1 + props.x2) / 2
  const dy = props.y2 - props.y1
  return mx - dy * props.curvatureOffset / Math.sqrt(dy * dy + (props.x2 - props.x1) ** 2 || 1)
})

const cy = computed(() => {
  const my = (props.y1 + props.y2) / 2
  const dx = props.x2 - props.x1
  return my + dx * props.curvatureOffset / Math.sqrt(dx * dx + (props.y2 - props.y1) ** 2 || 1)
})

const dashArray = computed(() => {
  switch (props.lineStyle) {
    case 'dashed': return '8 4'
    case 'dotted': return '2 4'
    default: return 'none'
  }
})
</script>
