import { onMounted, onUnmounted } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useHistoryStore } from '@/stores/history'
import { useClipboard } from '@/composables/useClipboard'

export function useKeyboard() {
  const graphStore = useGraphStore()
  const uiStore = useUiStore()
  const historyStore = useHistoryStore()
  const { copy, paste } = useClipboard()

  function deleteSelected() {
    const nodeIds = [...uiStore.selectedNodeIds]
    const edgeIds = [...uiStore.selectedEdgeIds]
    for (const id of edgeIds) {
      graphStore.removeEdge(id)
    }
    for (const id of nodeIds) {
      graphStore.removeNode(id)
    }
    uiStore.deselectAll()
  }

  function selectAll() {
    uiStore.selectedNodeIds = graphStore.nodes.map(n => n.id)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      deleteSelected()
      return
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        historyStore.undo()
        return
      }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        historyStore.redo()
        return
      }
      if (e.key === 'c') {
        e.preventDefault()
        copy()
        return
      }
      if (e.key === 'v') {
        e.preventDefault()
        paste()
        return
      }
      if (e.key === 'g') {
        e.preventDefault()
        const nodeIds = uiStore.selectedNodeIds
        if (nodeIds.length > 0) {
          graphStore.groupNodes(nodeIds)
        }
        return
      }
      if (e.key === 'a') {
        e.preventDefault()
        selectAll()
        return
      }
    }

    if (e.key === ' ') {
      e.preventDefault()
      uiStore.isPanning = true
      return
    }

    if (e.key === 'Escape') {
      uiStore.deselectAll()
      uiStore.hideContextMenu()
      uiStore.showNodeCreatePanel = false
      uiStore.showTemplateModal = false
      uiStore.showExportModal = false
      uiStore.showImportModal = false
      uiStore.showIconSearch = false
      uiStore.showSearchBar = false
      return
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.key === ' ') {
      uiStore.isPanning = false
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
  })
}
