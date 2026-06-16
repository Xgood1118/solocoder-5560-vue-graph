<template>
  <polygon
    :points="arrowPoints"
    :fill="color"
    :transform="`translate(${x}, ${y}) rotate(${angleDeg})`"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  x: number
  y: number
  angle: number
  color: string
  size?: number
}>(), {
  size: 10,
})

const angleDeg = computed(() => (props.angle * 180) / Math.PI)

const arrowPoints = computed(() => {
  const s = props.size
  return `0,${-s / 2} ${s},0 0,${s / 2}`
})
</script>
