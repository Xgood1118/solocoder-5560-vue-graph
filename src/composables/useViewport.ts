import { ref, type Ref } from 'vue'
import { useUiStore } from '@/stores/ui'

export function useViewport(canvasRef: Ref<SVGSVGElement | null>) {
  const uiStore = useUiStore()
  let isPanning = false
  let panStartX = 0
  let panStartY = 0
  let viewportStartX = 0
  let viewportStartY = 0

  function onWheel(event: WheelEvent) {
    event.preventDefault()
    if (event.ctrlKey || event.metaKey) {
      const delta = -event.deltaY * 0.01
      const newZoom = Math.min(4, Math.max(0.1, uiStore.viewport.zoom + delta))
      const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      const oldZoom = uiStore.viewport.zoom
      const scale = newZoom / oldZoom
      const newX = mouseX - (mouseX - uiStore.viewport.x) * scale
      const newY = mouseY - (mouseY - uiStore.viewport.y) * scale
      uiStore.setViewport({ x: newX, y: newY, zoom: newZoom })
    } else {
      uiStore.setViewport({
        x: uiStore.viewport.x - event.deltaX,
        y: uiStore.viewport.y - event.deltaY,
        zoom: uiStore.viewport.zoom,
      })
    }
  }

  function onPanMouseMove(e: MouseEvent) {
    if (!isPanning) return
    const dx = e.clientX - panStartX
    const dy = e.clientY - panStartY
    uiStore.setViewport({
      x: viewportStartX + dx,
      y: viewportStartY + dy,
      zoom: uiStore.viewport.zoom,
    })
  }

  function onPanMouseUp() {
    isPanning = false
    window.removeEventListener('mousemove', onPanMouseMove)
    window.removeEventListener('mouseup', onPanMouseUp)
  }

  function onMouseDown(event: MouseEvent) {
    if (uiStore.isPanning || event.button === 1) {
      event.preventDefault()
      isPanning = true
      panStartX = event.clientX
      panStartY = event.clientY
      viewportStartX = uiStore.viewport.x
      viewportStartY = uiStore.viewport.y
      window.addEventListener('mousemove', onPanMouseMove)
      window.addEventListener('mouseup', onPanMouseUp)
    }
  }

  return { onWheel, onCanvasMouseDown: onMouseDown }
}
