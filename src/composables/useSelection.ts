import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import type { Rect } from '@/types'

export function useSelection() {
  const graphStore = useGraphStore()
  const uiStore = useUiStore()

  function handleCanvasClick(_event: MouseEvent) {
    uiStore.deselectAll()
  }

  function handleNodeClick(event: MouseEvent, nodeId: string) {
    if (event.shiftKey) {
      const idx = uiStore.selectedNodeIds.indexOf(nodeId)
      if (idx >= 0) {
        uiStore.selectedNodeIds.splice(idx, 1)
      } else {
        uiStore.selectNode(nodeId, true)
      }
    } else {
      uiStore.selectNode(nodeId, false)
    }
  }

  function handleEdgeClick(event: MouseEvent, edgeId: string) {
    if (event.shiftKey) {
      const idx = uiStore.selectedEdgeIds.indexOf(edgeId)
      if (idx >= 0) {
        uiStore.selectedEdgeIds.splice(idx, 1)
      } else {
        uiStore.selectEdge(edgeId, true)
      }
    } else {
      uiStore.selectEdge(edgeId, false)
    }
  }

  function handleBoxSelect(rect: Rect) {
    const nodesInRect = graphStore.getNodesInRect(rect)
    for (const node of nodesInRect) {
      if (!uiStore.selectedNodeIds.includes(node.id)) {
        uiStore.selectedNodeIds.push(node.id)
      }
    }
  }

  return { handleCanvasClick, handleNodeClick, handleEdgeClick, handleBoxSelect }
}
