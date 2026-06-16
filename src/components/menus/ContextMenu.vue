<template>
  <Teleport to="body">
    <div
      v-if="contextMenu.visible"
      class="fixed z-50 rounded-md shadow-lg py-1 min-w-[160px]"
      :style="{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
        backgroundColor: themeColors.panelBg,
        border: `1px solid ${themeColors.panelBorder}`,
      }"
      @click.stop
    >
      <template v-if="contextMenu.targetType === 'node'">
        <ContextMenuItem :icon="Trash2" label="Delete" @click="onDelete" />
        <ContextMenuItem :icon="CopyIcon" label="Copy" @click="onCopy" />
        <ContextMenuItem :icon="Palette" label="Change Style" @click="onChangeStyle" />
        <ContextMenuItem :icon="ArrowUpToLine" label="Bring to Front" @click="onBringToFront" />
        <ContextMenuItem :icon="ArrowDownToLine" label="Send to Back" @click="onSendToBack" />
      </template>
      <template v-else-if="contextMenu.targetType === 'edge'">
        <ContextMenuItem :icon="Trash2" label="Delete" @click="onDelete" />
        <ContextMenuItem :icon="Palette" label="Change Style" @click="onChangeStyle" />
      </template>
      <template v-else-if="contextMenu.targetType === 'group'">
        <ContextMenuItem :icon="Layers" label="Toggle Collapse" @click="onToggleCollapse" />
        <ContextMenuItem :icon="Ungroup" label="Ungroup" @click="onUngroup" />
        <ContextMenuItem :icon="Trash2" label="Delete" @click="onDeleteGroup" />
      </template>
      <template v-else-if="contextMenu.targetType === 'canvas'">
        <ContextMenuItem :icon="ClipboardPaste" label="Paste" @click="onPaste" />
        <ContextMenuItem :icon="GroupIcon" label="Group Selected" @click="onGroupSelected" />
        <ContextMenuItem :icon="CheckSquare" label="Select All" @click="onSelectAll" />
      </template>
    </div>
    <div
      v-if="contextMenu.visible"
      class="fixed inset-0 z-40"
      @click="hideContextMenu"
      @contextmenu.prevent="hideContextMenu"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useGraphStore } from '@/stores/graph'
import { useThemeStore } from '@/stores/theme'
import { useClipboard } from '@/composables/useClipboard'
import {
  Trash2,
  Copy as CopyIcon,
  Palette,
  ArrowUpToLine,
  ArrowDownToLine,
  ClipboardPaste,
  CheckSquare,
  Layers,
  Ungroup,
  Group as GroupIcon,
} from 'lucide-vue-next'
import ContextMenuItem from './ContextMenuItem.vue'

const uiStore = useUiStore()
const graphStore = useGraphStore()
const themeStore = useThemeStore()
const { copy, paste } = useClipboard()

const themeColors = computed(() => themeStore.themeColors)
const contextMenu = computed(() => uiStore.contextMenu)

function onDelete() {
  const { targetType, targetId } = contextMenu.value
  if (targetType === 'node') graphStore.removeNode(targetId)
  else if (targetType === 'edge') graphStore.removeEdge(targetId)
  uiStore.hideContextMenu()
}

function onCopy() {
  copy()
  uiStore.hideContextMenu()
}

function onChangeStyle() {
  uiStore.setPropertyPanelOpen(true)
  uiStore.hideContextMenu()
}

function onBringToFront() {
  const node = graphStore.getNodeById(contextMenu.value.targetId)
  if (node) {
    const maxZ = Math.max(...graphStore.nodes.map(n => n.zIndex))
    graphStore.updateNode(node.id, { zIndex: maxZ + 1 })
  }
  uiStore.hideContextMenu()
}

function onSendToBack() {
  const node = graphStore.getNodeById(contextMenu.value.targetId)
  if (node) {
    const minZ = Math.min(...graphStore.nodes.map(n => n.zIndex))
    graphStore.updateNode(node.id, { zIndex: minZ - 1 })
  }
  uiStore.hideContextMenu()
}

function onPaste() {
  paste()
  uiStore.hideContextMenu()
}

function onSelectAll() {
  uiStore.selectedNodeIds = graphStore.nodes.map(n => n.id)
  uiStore.hideContextMenu()
}

function onGroupSelected() {
  const nodeIds = uiStore.selectedNodeIds.filter(id => graphStore.getNodeById(id))
  if (nodeIds.length > 0) {
    graphStore.groupNodes(nodeIds)
  }
  uiStore.hideContextMenu()
}

function onToggleCollapse() {
  const groupId = contextMenu.value.targetId
  if (groupId) {
    graphStore.toggleGroupCollapse(groupId)
  }
  uiStore.hideContextMenu()
}

function onUngroup() {
  const groupId = contextMenu.value.targetId
  if (groupId) {
    graphStore.ungroupNodes(groupId)
  }
  uiStore.hideContextMenu()
}

function onDeleteGroup() {
  const groupId = contextMenu.value.targetId
  if (groupId) {
    graphStore.removeGroup(groupId)
  }
  uiStore.hideContextMenu()
}

function hideContextMenu() {
  uiStore.hideContextMenu()
}
</script>
