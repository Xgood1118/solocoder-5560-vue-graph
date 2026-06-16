<script setup lang="ts">
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import type { GraphDocument } from '@/types'
import { templates } from '@/utils/templates'
import { X } from 'lucide-vue-next'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

function close() {
  uiStore.showTemplateModal = false
}

function selectTemplate(tpl: typeof templates[0]) {
  const doc: GraphDocument = {
    id: 'doc_' + Date.now(),
    name: tpl.name,
    templateId: tpl.id,
    nodes: tpl.nodes.map(n => ({ ...n, id: n.id + '_' + Date.now(), data: { ...n.data }, style: { ...n.style } })),
    edges: tpl.edges.map(e => ({ ...e, id: e.id + '_' + Date.now(), style: { ...e.style } })),
    groups: tpl.groups.map(g => ({ ...g, id: g.id + '_' + Date.now() })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  graphStore.setDocument(doc)
  close()
}
</script>

<template>
  <div v-if="uiStore.showTemplateModal" class="modal-overlay" @click.self="close">
    <div class="modal-content" :style="{ background: themeStore.themeColors.panelBg, border: `1px solid ${themeStore.themeColors.panelBorder}` }">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold" :style="{ color: themeStore.themeColors.textPrimary }">选择模板</h2>
        <button @click="close" class="p-1 rounded hover:bg-white/10" :style="{ color: themeStore.themeColors.textSecondary }">
          <X :size="20" />
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="tpl in templates"
          :key="tpl.id"
          @click="selectTemplate(tpl)"
          class="p-3 rounded-lg border text-left transition-colors"
          :style="{
            background: themeStore.themeColors.inputBg,
            borderColor: themeStore.themeColors.inputBorder,
          }"
        >
          <div class="text-sm font-medium mb-1" :style="{ color: themeStore.themeColors.textPrimary }">{{ tpl.name }}</div>
          <div class="text-xs" :style="{ color: themeStore.themeColors.textSecondary }">{{ tpl.description }}</div>
          <div class="mt-2 flex gap-1">
            <svg
              v-for="node in tpl.nodes.slice(0, 4)"
              :key="node.id"
              width="20" height="14" viewBox="0 0 20 14"
            >
              <rect
                x="1" y="1" width="18" height="12" rx="2"
                :fill="node.style.fillColor"
                :stroke="node.style.strokeColor"
                stroke-width="1"
              />
            </svg>
          </div>
          <div class="text-xs mt-1.5" :style="{ color: themeStore.themeColors.textSecondary }">
            {{ tpl.nodes.length }} 节点 · {{ tpl.edges.length }} 边
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
