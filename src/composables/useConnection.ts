import { ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { DEFAULT_EDGE_STYLE } from '@/types'
import type { Point } from '@/types'

export function useConnection() {
  const isConnecting = ref(false)
  const connectionStart = ref<{ nodeId: string; handleId: string } | null>(null)
  const connectionEnd = ref<Point | null>(null)

  function screenToCanvas(screenX: number, screenY: number): Point {
    const uiStore = useUiStore()
    const { x: offsetX, y: offsetY, zoom } = uiStore.viewport
    return {
      x: (screenX - offsetX) / zoom,
      y: (screenY - offsetY) / zoom,
    }
  }

  function startConnection(event: MouseEvent, nodeId: string, handleId: string) {
    isConnecting.value = true
    connectionStart.value = { nodeId, handleId }
    connectionEnd.value = screenToCanvas(event.clientX, event.clientY)
  }

  function updateConnection(event: MouseEvent) {
    if (!isConnecting.value) return
    connectionEnd.value = screenToCanvas(event.clientX, event.clientY)
  }

  function endConnection(nodeId: string, handleId: string) {
    if (!isConnecting.value || !connectionStart.value) {
      cancelConnection()
      return
    }
    if (connectionStart.value.nodeId === nodeId) {
      cancelConnection()
      return
    }
    const graphStore = useGraphStore()
    graphStore.addEdge({
      sourceId: connectionStart.value.nodeId,
      targetId: nodeId,
      sourceHandle: connectionStart.value.handleId,
      targetHandle: handleId,
      style: { ...DEFAULT_EDGE_STYLE },
    })
    resetState()
  }

  function cancelConnection() {
    resetState()
  }

  function resetState() {
    isConnecting.value = false
    connectionStart.value = null
    connectionEnd.value = null
  }

  return { startConnection, updateConnection, endConnection, cancelConnection, isConnecting, connectionStart, connectionEnd }
}
