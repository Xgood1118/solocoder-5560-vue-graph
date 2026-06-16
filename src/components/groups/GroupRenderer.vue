<script setup lang="ts">
import { computed } from 'vue'
import type { GraphGroup } from '@/types'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  group: GraphGroup
}>()

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const bbox = computed(() => graphStore.getGroupBoundingBox(props.group.id))

const isSelected = computed(() => uiStore.selectedNodeIds.includes(props.group.id))

const colors = computed(() => themeStore.themeColors)

function toggleCollapse() {
  graphStore.toggleGroupCollapse(props.group.id)
}

function onMouseDown(e: MouseEvent) {
  e.stopPropagation()
}

function onClick(e: MouseEvent) {
  e.stopPropagation()
  if (e.shiftKey) {
    const idx = uiStore.selectedNodeIds.indexOf(props.group.id)
    if (idx >= 0) {
      uiStore.selectedNodeIds.splice(idx, 1)
    } else {
      uiStore.selectedNodeIds.push(props.group.id)
    }
  } else {
    uiStore.selectedNodeIds = [props.group.id]
    uiStore.selectedEdgeIds = []
  }
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  uiStore.showContextMenu(e.clientX, e.clientY, 'group', props.group.id)
}
</script>

<template>
  <g v-if="bbox" :transform="`translate(${bbox.x}, ${bbox.y})`">
    <rect
      :width="bbox.width"
      :height="bbox.height"
      :rx="8"
      :fill="isSelected ? colors.accent + '15' : colors.panelBg + '40'"
      :stroke="isSelected ? colors.accent : colors.panelBorder"
      :stroke-width="isSelected ? 2 : 1"
      stroke-dasharray="6 4"
      style="cursor: pointer"
      @mousedown="onMouseDown"
      @click="onClick"
      @contextmenu="onContextMenu"
    />

    <g
      class="group-header"
      :transform="`translate(8, 4)`"
      style="cursor: pointer"
      @click.stop="toggleCollapse"
    >
      <foreignObject :width="bbox.width - 16" :height="20">
        <div
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: colors.textSecondary,
            userSelect: 'none',
          }"
        >
          <ChevronDown v-if="!group.collapsed" :size="14" />
          <ChevronRight v-else :size="14" />
          <span class="truncate">{{ group.label }}</span>
          <span style="opacity: 0.6">({{ group.childNodeIds.length }})</span>
        </div>
      </foreignObject>
    </g>

    <rect
      v-if="group.collapsed"
      :x="bbox.width / 2 - 40"
      :y="bbox.height / 2 - 15"
      width="80"
      height="30"
      rx="4"
      :fill="colors.inputBg"
      :stroke="colors.inputBorder"
      stroke-width="1"
    />
    <text
      v-if="group.collapsed"
      :x="bbox.width / 2"
      :y="bbox.height / 2 + 4"
      text-anchor="middle"
      :fill="colors.textSecondary"
      font-size="12"
    >
      +{{ group.childNodeIds.length }}
    </text>
  </g>
</template>
