import { ref } from 'vue'
import { useGraphStore } from '@/stores/graph'
import { useUiStore } from '@/stores/ui'
import { useHistoryStore } from '@/stores/history'
import { useGridSnap } from '@/composables/useGridSnap'

export function useDrag() {
  const isDragging = ref(false)
  let startX = 0
  let startY = 0
  let nodeStartX = 0
  let nodeStartY = 0
  let draggingNodeId: string | null = null

  function screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    const uiStore = useUiStore()
    const { x: offsetX, y: offsetY, zoom } = uiStore.viewport
    return {
      x: (screenX - offsetX) / zoom,
      y: (screenY - offsetY) / zoom,
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging.value || !draggingNodeId) return
    const graphStore = useGraphStore()
    const { snapPoint } = useGridSnap()
    const canvasPos = screenToCanvas(e.clientX, e.clientY)
    const startCanvasPos = screenToCanvas(startX, startY)
    const dx = canvasPos.x - startCanvasPos.x
    const dy = canvasPos.y - startCanvasPos.y
    const newX = nodeStartX + dx
    const newY = nodeStartY + dy
    const snapped = snapPoint(newX, newY)
    graphStore.updateNode(draggingNodeId, { x: snapped.x, y: snapped.y })
  }

  function onMouseUp() {
    if (!isDragging.value) return
    isDragging.value = false
    draggingNodeId = null
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  function onNodeMouseDown(event: MouseEvent, nodeId: string) {
    event.preventDefault()
    event.stopPropagation()
    const graphStore = useGraphStore()
    const historyStore = useHistoryStore()
    const node = graphStore.getNodeById(nodeId)
    if (!node) return
    historyStore.pushHistory('drag-node')
    isDragging.value = true
    draggingNodeId = nodeId
    startX = event.clientX
    startY = event.clientY
    nodeStartX = node.x
    nodeStartY = node.y
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return { onNodeMouseDown, isDragging }
}
