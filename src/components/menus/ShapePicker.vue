<template>
  <div class="grid grid-cols-3 gap-2 p-2">
    <button
      v-for="shape in shapes"
      :key="shape.value"
      class="flex flex-col items-center gap-1 p-2 rounded-md transition-colors"
      :style="{
        border: modelValue === shape.value ? `2px solid ${themeColors.accent}` : `1px solid ${themeColors.panelBorder}`,
        backgroundColor: modelValue === shape.value ? themeColors.accent + '22' : 'transparent',
      }"
      @click="emit('update:modelValue', shape.value)"
    >
      <svg width="36" height="24" :viewBox="`0 0 36 24`">
        <path :d="getShapePath(shape.value, 36, 24)" :fill="themeColors.toolbarHover" :stroke="themeColors.textSecondary" stroke-width="1.5" />
      </svg>
      <span class="text-[10px]" :style="{ color: themeColors.textSecondary }">{{ shape.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NodeShape } from '@/types'
import { NODE_SHAPE_LABELS } from '@/types'
import { useThemeStore } from '@/stores/theme'
import { getShapePath } from '@/utils/svgShapes'

const props = defineProps<{
  modelValue: NodeShape
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: NodeShape): void
}>()

const themeStore = useThemeStore()
const themeColors = computed(() => themeStore.themeColors)

const shapes: { value: NodeShape; label: string }[] = Object.entries(NODE_SHAPE_LABELS).map(
  ([value, label]) => ({ value: value as NodeShape, label })
)
</script>
