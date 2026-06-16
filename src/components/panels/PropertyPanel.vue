<script setup lang="ts">
import { computed } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useThemeStore } from '@/stores/theme'
import type { NodeShape, ArrowDirection, LineStyle, Curvature } from '@/types'
import { NODE_SHAPE_LABELS } from '@/types'
import { PanelRightClose, PanelRightOpen, Trash2, Copy, Bold, Italic, Underline } from 'lucide-vue-next'
import KeyValueEditor from './KeyValueEditor.vue'

const graphStore = useGraphStore()
const uiStore = useUiStore()
const themeStore = useThemeStore()

const colors = themeStore.themeColors

const selectedNode = computed(() => {
  if (uiStore.selectedNodeIds.length === 1) {
    return graphStore.getNodeById(uiStore.selectedNodeIds[0])
  }
  return null
})

const selectedEdge = computed(() => {
  if (uiStore.selectedEdgeIds.length === 1) {
    return graphStore.getEdgeById(uiStore.selectedEdgeIds[0])
  }
  return null
})

const selectionMode = computed<'none' | 'node' | 'edge' | 'multiple'>(() => {
  const nc = uiStore.selectedNodeIds.length
  const ec = uiStore.selectedEdgeIds.length
  if (nc === 0 && ec === 0) return 'none'
  if (nc === 1 && ec === 0) return 'node'
  if (ec === 1 && nc === 0) return 'edge'
  return 'multiple'
})

const panelStyle = computed(() => ({
  background: colors.panelBg,
  borderLeft: `1px solid ${colors.panelBorder}`,
}))

function updateNodeLabel(val: string) {
  if (selectedNode.value) graphStore.updateNode(selectedNode.value.id, { label: val })
}

function updateNodeShape(shape: NodeShape) {
  if (selectedNode.value) graphStore.updateNode(selectedNode.value.id, { shape })
}

function updateNodeStyle(key: string, value: string | number | boolean) {
  if (!selectedNode.value) return
  graphStore.updateNode(selectedNode.value.id, { style: { ...selectedNode.value.style, [key]: value } })
}

function updateNodeData(data: Record<string, string>) {
  if (selectedNode.value) graphStore.updateNode(selectedNode.value.id, { data })
}

function updateEdgeLabel(val: string) {
  if (selectedEdge.value) graphStore.updateEdge(selectedEdge.value.id, { label: val })
}

function updateEdgeStyle(key: string, value: string | number) {
  if (!selectedEdge.value) return
  graphStore.updateEdge(selectedEdge.value.id, { style: { ...selectedEdge.value.style, [key]: value } })
}

function updateEdgeArrowDirection(val: ArrowDirection) {
  if (selectedEdge.value) graphStore.updateEdge(selectedEdge.value.id, { style: { ...selectedEdge.value.style, arrowDirection: val } })
}

function updateEdgeLineStyle(val: LineStyle) {
  if (selectedEdge.value) graphStore.updateEdge(selectedEdge.value.id, { style: { ...selectedEdge.value.style, lineStyle: val } })
}

function updateEdgeCurvature(val: Curvature) {
  if (selectedEdge.value) graphStore.updateEdge(selectedEdge.value.id, { style: { ...selectedEdge.value.style, curvature: val } })
}

function deleteSelected() {
  for (const id of uiStore.selectedEdgeIds) graphStore.removeEdge(id)
  for (const id of uiStore.selectedNodeIds) graphStore.removeNode(id)
  uiStore.deselectAll()
}

const inputStyle = computed(() => ({
  background: colors.inputBg,
  borderColor: colors.inputBorder,
  color: colors.textPrimary,
}))

const labelStyle = computed(() => ({
  color: colors.textSecondary,
}))
</script>

<template>
  <div
    v-if="uiStore.propertyPanelOpen"
    class="fixed right-0 top-0 h-full property-panel-scroll overflow-y-auto z-30"
    :style="{ ...panelStyle, width: '280px', paddingTop: '48px' }"
  >
    <div class="p-3 space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold" :style="{ color: colors.textSecondary }">属性</span>
        <button @click="uiStore.setPropertyPanelOpen(false)" class="p-1 rounded hover:bg-white/10" :style="{ color: colors.textSecondary }">
          <PanelRightClose :size="16" />
        </button>
      </div>

      <template v-if="selectionMode === 'none'">
        <div class="space-y-2">
          <div class="text-xs font-medium" :style="labelStyle">文档属性</div>
          <div class="text-sm" :style="{ color: colors.textPrimary }">{{ graphStore.document.name }}</div>
          <div class="text-xs" :style="labelStyle">节点: {{ graphStore.nodes.length }}</div>
          <div class="text-xs" :style="labelStyle">边: {{ graphStore.edges.length }}</div>
        </div>
      </template>

      <template v-else-if="selectionMode === 'node' && selectedNode">
        <div class="space-y-3">
          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">标签</label>
            <input
              :value="selectedNode.label"
              @input="updateNodeLabel(($event.target as HTMLInputElement).value)"
              class="w-full px-2 py-1 text-sm rounded border outline-none"
              :style="inputStyle"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">形状</label>
            <select
              :value="selectedNode.shape"
              @change="updateNodeShape(($event.target as HTMLSelectElement).value as NodeShape)"
              class="w-full px-2 py-1 text-sm rounded border outline-none"
              :style="inputStyle"
            >
              <option v-for="(lbl, key) in NODE_SHAPE_LABELS" :key="key" :value="key">{{ lbl }}</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">填充颜色</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                :value="selectedNode.style.fillColor"
                @input="updateNodeStyle('fillColor', ($event.target as HTMLInputElement).value)"
                class="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                :value="selectedNode.style.fillColor"
                @input="updateNodeStyle('fillColor', ($event.target as HTMLInputElement).value)"
                class="flex-1 px-2 py-1 text-xs rounded border outline-none mono"
                :style="inputStyle"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">边框颜色</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                :value="selectedNode.style.strokeColor"
                @input="updateNodeStyle('strokeColor', ($event.target as HTMLInputElement).value)"
                class="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                :value="selectedNode.style.strokeColor"
                @input="updateNodeStyle('strokeColor', ($event.target as HTMLInputElement).value)"
                class="flex-1 px-2 py-1 text-xs rounded border outline-none mono"
                :style="inputStyle"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">边框宽度</label>
            <input
              type="range"
              :value="selectedNode.style.strokeWidth"
              @input="updateNodeStyle('strokeWidth', Number(($event.target as HTMLInputElement).value))"
              min="0" max="8" step="1"
              class="w-full"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">文字颜色</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                :value="selectedNode.style.textColor"
                @input="updateNodeStyle('textColor', ($event.target as HTMLInputElement).value)"
                class="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                :value="selectedNode.style.textColor"
                @input="updateNodeStyle('textColor', ($event.target as HTMLInputElement).value)"
                class="flex-1 px-2 py-1 text-xs rounded border outline-none mono"
                :style="inputStyle"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">字号</label>
            <input
              type="number"
              :value="selectedNode.style.fontSize"
              @input="updateNodeStyle('fontSize', Number(($event.target as HTMLInputElement).value))"
              min="8" max="72"
              class="w-full px-2 py-1 text-sm rounded border outline-none"
              :style="inputStyle"
            />
          </div>

          <div class="flex gap-1">
            <button
              @click="updateNodeStyle('bold', !selectedNode.style.bold)"
              class="p-1.5 rounded"
              :style="{ background: selectedNode.style.bold ? colors.accent + '33' : 'transparent', color: selectedNode.style.bold ? colors.accent : colors.textSecondary }"
            >
              <Bold :size="16" />
            </button>
            <button
              @click="updateNodeStyle('italic', !selectedNode.style.italic)"
              class="p-1.5 rounded"
              :style="{ background: selectedNode.style.italic ? colors.accent + '33' : 'transparent', color: selectedNode.style.italic ? colors.accent : colors.textSecondary }"
            >
              <Italic :size="16" />
            </button>
            <button
              @click="updateNodeStyle('underline', !selectedNode.style.underline)"
              class="p-1.5 rounded"
              :style="{ background: selectedNode.style.underline ? colors.accent + '33' : 'transparent', color: selectedNode.style.underline ? colors.accent : colors.textSecondary }"
            >
              <Underline :size="16" />
            </button>
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">元数据</label>
            <KeyValueEditor :model-value="selectedNode.data" @update:model-value="updateNodeData" />
          </div>
        </div>
      </template>

      <template v-else-if="selectionMode === 'edge' && selectedEdge">
        <div class="space-y-3">
          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">标签</label>
            <input
              :value="selectedEdge.label ?? ''"
              @input="updateEdgeLabel(($event.target as HTMLInputElement).value)"
              class="w-full px-2 py-1 text-sm rounded border outline-none"
              :style="inputStyle"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">箭头方向</label>
            <select
              :value="selectedEdge.style.arrowDirection"
              @change="updateEdgeArrowDirection(($event.target as HTMLSelectElement).value as ArrowDirection)"
              class="w-full px-2 py-1 text-sm rounded border outline-none"
              :style="inputStyle"
            >
              <option value="unidirectional">单向</option>
              <option value="bidirectional">双向</option>
              <option value="none">无</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">线型</label>
            <select
              :value="selectedEdge.style.lineStyle"
              @change="updateEdgeLineStyle(($event.target as HTMLSelectElement).value as LineStyle)"
              class="w-full px-2 py-1 text-sm rounded border outline-none"
              :style="inputStyle"
            >
              <option value="solid">实线</option>
              <option value="dashed">虚线</option>
              <option value="dotted">点线</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">线宽</label>
            <input
              type="number"
              :value="selectedEdge.style.lineWidth"
              @input="updateEdgeStyle('lineWidth', Number(($event.target as HTMLInputElement).value))"
              min="1" max="10"
              class="w-full px-2 py-1 text-sm rounded border outline-none"
              :style="inputStyle"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">线条颜色</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                :value="selectedEdge.style.lineColor"
                @input="updateEdgeStyle('lineColor', ($event.target as HTMLInputElement).value)"
                class="w-8 h-8 rounded cursor-pointer border-0"
              />
              <input
                :value="selectedEdge.style.lineColor"
                @input="updateEdgeStyle('lineColor', ($event.target as HTMLInputElement).value)"
                class="flex-1 px-2 py-1 text-xs rounded border outline-none mono"
                :style="inputStyle"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs" :style="labelStyle">曲率</label>
            <select
              :value="selectedEdge.style.curvature"
              @change="updateEdgeCurvature(($event.target as HTMLSelectElement).value as Curvature)"
              class="w-full px-2 py-1 text-sm rounded border outline-none"
              :style="inputStyle"
            >
              <option value="straight">直线</option>
              <option value="arc">弧线</option>
              <option value="polyline">折线</option>
            </select>
          </div>
        </div>
      </template>

      <template v-else-if="selectionMode === 'multiple'">
        <div class="space-y-3">
          <div class="text-xs" :style="labelStyle">
            已选择 {{ uiStore.selectedNodeIds.length }} 个节点, {{ uiStore.selectedEdgeIds.length }} 条边
          </div>
          <button
            @click="deleteSelected"
            class="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded"
            :style="{ background: colors.danger + '22', color: colors.danger }"
          >
            <Trash2 :size="14" /> 删除选中
          </button>
        </div>
      </template>
    </div>
  </div>

  <button
    v-else
    @click="uiStore.setPropertyPanelOpen(true)"
    class="fixed right-0 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-l"
    :style="{ background: colors.panelBg, border: `1px solid ${colors.panelBorder}`, borderRight: 'none', color: colors.textSecondary }"
  >
    <PanelRightOpen :size="16" />
  </button>
</template>
