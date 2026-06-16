<template>
  <line
    :x1="x1"
    :y1="y1"
    :x2="x2"
    :y2="y2"
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

const dashArray = computed(() => {
  switch (props.lineStyle) {
    case 'dashed': return '8 4'
    case 'dotted': return '2 4'
    default: return 'none'
  }
})
</script>
