<script setup lang="ts">
import type { GraphNode } from '@/types'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  node: GraphNode
  offsetY?: number
}>(), {
  offsetY: 0,
})

const displayText = computed(() => {
  const maxLen = Math.floor(props.node.width / (props.node.style.fontSize * 0.6))
  if (props.node.label.length <= maxLen) return props.node.label
  return props.node.label.slice(0, maxLen - 1) + '…'
})
</script>

<template>
  <text
    :x="node.width / 2"
    :y="node.height / 2 + offsetY"
    :fill="node.style.textColor"
    :font-size="node.style.fontSize"
    :font-weight="node.style.bold ? 'bold' : 'normal'"
    :font-style="node.style.italic ? 'italic' : 'normal'"
    :text-decoration="node.style.underline ? 'underline' : 'none'"
    dominant-baseline="central"
    text-anchor="middle"
    pointer-events="none"
    style="user-select: none"
  >{{ displayText }}</text>
</template>
