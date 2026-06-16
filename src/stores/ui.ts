import { defineStore } from 'pinia'
import type { GraphNode, GraphEdge, Viewport, ToolMode } from '@/types'
import { useGraphStore } from './graph'

export const useUiStore = defineStore('ui', {
  state: () => ({
    selectedNodeIds: [] as string[],
    selectedEdgeIds: [] as string[],
    hoveredNodeId: null as string | null,
    viewport: { x: 0, y: 0, zoom: 1 } as Viewport,
    isPanning: false,
    isBoxSelecting: false,
    activeTool: 'select' as ToolMode,
    searchQuery: '',
    searchResults: [] as string[],
    contextMenu: {
      visible: false,
      x: 0,
      y: 0,
      targetType: '' as string,
      targetId: '' as string,
    },
    showNodeCreatePanel: false,
    nodeCreatePosition: { x: 0, y: 0 },
    nodeCreateScreenPosition: { x: 0, y: 0 },
    showTemplateModal: false,
    showExportModal: false,
    showImportModal: false,
    showIconSearch: false,
    showSearchBar: false,
    propertyPanelOpen: true,
    miniMapOpen: true,
  }),
  getters: {
    hasSelection: (state) => state.selectedNodeIds.length > 0 || state.selectedEdgeIds.length > 0,
    selectedNodes(): GraphNode[] {
      const graphStore = useGraphStore()
      return graphStore.nodes.filter((n: GraphNode) => this.selectedNodeIds.includes(n.id))
    },
    selectedEdges(): GraphEdge[] {
      const graphStore = useGraphStore()
      return graphStore.edges.filter((e: GraphEdge) => this.selectedEdgeIds.includes(e.id))
    },
  },
  actions: {
    selectNode(id: string, additive = false) {
      if (!additive) {
        this.selectedNodeIds = [id]
        this.selectedEdgeIds = []
      } else {
        if (!this.selectedNodeIds.includes(id)) {
          this.selectedNodeIds.push(id)
        }
      }
    },
    selectEdge(id: string, additive = false) {
      if (!additive) {
        this.selectedEdgeIds = [id]
        this.selectedNodeIds = []
      } else {
        if (!this.selectedEdgeIds.includes(id)) {
          this.selectedEdgeIds.push(id)
        }
      }
    },
    deselectAll() {
      this.selectedNodeIds = []
      this.selectedEdgeIds = []
    },
    setHoveredNode(id: string | null) {
      this.hoveredNodeId = id
    },
    setViewport(vp: Viewport) {
      this.viewport = { ...vp }
    },
    zoomIn() {
      this.viewport = {
        ...this.viewport,
        zoom: Math.min(4, this.viewport.zoom + 0.1),
      }
    },
    zoomOut() {
      this.viewport = {
        ...this.viewport,
        zoom: Math.max(0.1, this.viewport.zoom - 0.1),
      }
    },
    resetViewport() {
      this.viewport = { x: 0, y: 0, zoom: 1 }
    },
    setActiveTool(tool: ToolMode) {
      this.activeTool = tool
    },
    toggleSearch() {
      this.showSearchBar = !this.showSearchBar
      if (!this.showSearchBar) {
        this.searchQuery = ''
        this.searchResults = []
      }
    },
    performSearch() {
      const graphStore = useGraphStore()
      const query = this.searchQuery.toLowerCase().trim()
      if (!query) {
        this.searchResults = []
        return
      }
      this.searchResults = graphStore.nodes
        .filter((n: GraphNode) => {
          if (n.label.toLowerCase().includes(query)) return true
          return Object.entries(n.data).some(
            ([key, value]) => key.toLowerCase().includes(query) || value.toLowerCase().includes(query)
          )
        })
        .map((n: GraphNode) => n.id)
    },
    showContextMenu(x: number, y: number, targetType: string, targetId: string) {
      this.contextMenu = { visible: true, x, y, targetType, targetId }
    },
    hideContextMenu() {
      this.contextMenu.visible = false
    },
    toggleNodeCreatePanel(canvasX: number, canvasY: number, screenX?: number, screenY?: number) {
      this.showNodeCreatePanel = !this.showNodeCreatePanel
      this.nodeCreatePosition = { x: canvasX, y: canvasY }
      if (screenX !== undefined && screenY !== undefined) {
        this.nodeCreateScreenPosition = { x: screenX, y: screenY }
      }
    },
    setPropertyPanelOpen(open: boolean) {
      this.propertyPanelOpen = open
    },
  },
})
