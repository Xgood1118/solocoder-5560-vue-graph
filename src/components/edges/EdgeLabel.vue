<template>
  <g :transform="`translate(${x}, ${y})`">
    <rect
      :x="-textWidth / 2 - 4"
      :y="-10"
      :width="textWidth + 8"
      height="20"
      rx="3"
      fill="white"
      stroke="#e2e8f0"
      stroke-width="1"
    />
    <text
      ref="textEl"
      text-anchor="middle"
      dominant-baseline="central"
      :fill="textColor"
      font-size="12"
      @dblclick="onDblClick"
    >{{ label }}</text>
  </g>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const props = defineProps<{
  x: number
  y: number
  label: string
  edgeId: string
}>()

const emit = defineEmits<{
  (e: 'editLabel', edgeId: string): void
}>()

const themeStore = useThemeStore()
const textColor = computed(() => themeStore.themeColors.textPrimary)
const textEl = ref<SVGTextElement | null>(null)
const textWidth = ref(40)

onMounted(() => {
  if (textEl.value) {
    textWidth.value = textEl.value.getComputedTextLength() || 40
  }
})

function onDblClick() {
  emit('editLabel', props.edgeId)
}
</script>
