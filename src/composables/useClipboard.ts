import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { generateId } from '@/utils/id'
import type { GraphNode, GraphEdge } from '@/types'

interface ClipboardData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export function useClipboard() {
  const graphStore = useGraphStore()
  const uiStore = useUiStore()

  async function copy() {
    const selectedNodes = uiStore.selectedNodes
    const selectedEdges = uiStore.selectedEdges
    if (selectedNodes.length === 0) return
    const data: ClipboardData = { nodes: selectedNodes, edges: selectedEdges }
    const json = JSON.stringify(data)
    await navigator.clipboard.writeText(json)
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText()
      const data: ClipboardData = JSON.parse(text)
      if (!data.nodes || !Array.isArray(data.nodes)) return
      const idMap = new Map<string, string>()
      const offset = 20
      for (const node of data.nodes) {
        const newId = generateId('node-')
        idMap.set(node.id, newId)
        graphStore.addNode({
          label: node.label,
          x: node.x + offset,
          y: node.y + offset,
          width: node.width,
          height: node.height,
          shape: node.shape,
          style: { ...node.style },
          groupId: node.groupId,
        })
      }
      if (data.edges && Array.isArray(data.edges)) {
        for (const edge of data.edges) {
          const newSourceId = idMap.get(edge.sourceId)
          const newTargetId = idMap.get(edge.targetId)
          if (!newSourceId || !newTargetId) continue
          graphStore.addEdge({
            sourceId: newSourceId,
            targetId: newTargetId,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            label: edge.label,
            style: { ...edge.style },
          })
        }
      }
    } catch {
      // clipboard read failed or invalid JSON
    }
  }

  return { copy, paste }
}
