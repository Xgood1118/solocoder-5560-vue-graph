import { defineStore } from 'pinia'
import type { GraphDocument, GraphNode, GraphEdge, GraphGroup, NodeStyle, EdgeStyle, NodeShape, Rect } from '@/types'
import { DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE } from '@/types'
import { useHistoryStore } from './history'

const generateNodeId = () => 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
const generateEdgeId = () => 'e_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
const generateGroupId = () => 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)

function createEmptyDocument(): GraphDocument {
  return {
    id: 'doc_' + Date.now(),
    name: 'Untitled',
    nodes: [],
    edges: [],
    groups: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export const useGraphStore = defineStore('graph', {
  state: () => ({
    document: createEmptyDocument(),
  }),
  getters: {
    nodes: (state) => state.document.nodes,
    edges: (state) => state.document.edges,
    groups: (state) => state.document.groups,
  },
  actions: {
    addNode(payload: { label: string; x: number; y: number; width: number; height: number; shape: NodeShape; groupId?: string; style?: NodeStyle }) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('addNode')
      const node: GraphNode = {
        id: generateNodeId(),
        groupId: payload.groupId,
        label: payload.label,
        x: payload.x,
        y: payload.y,
        width: payload.width,
        height: payload.height,
        shape: payload.shape,
        style: payload.style ?? { ...DEFAULT_NODE_STYLE },
        data: {},
        zIndex: this.document.nodes.length,
      }
      this.document.nodes.push(node)
      this.document.updatedAt = Date.now()
    },
    updateNode(id: string, updates: Partial<GraphNode>) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('updateNode')
      const node = this.document.nodes.find(n => n.id === id)
      if (node) {
        Object.assign(node, updates)
        this.document.updatedAt = Date.now()
      }
    },
    removeNode(id: string) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('removeNode')
      this.document.edges = this.document.edges.filter(e => e.sourceId !== id && e.targetId !== id)
      this.document.nodes = this.document.nodes.filter(n => n.id !== id)
      this.document.updatedAt = Date.now()
    },
    addEdge(payload: { sourceId: string; targetId: string; sourceHandle?: string; targetHandle?: string; label?: string; style?: EdgeStyle }) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('addEdge')
      const edge: GraphEdge = {
        id: generateEdgeId(),
        sourceId: payload.sourceId,
        targetId: payload.targetId,
        sourceHandle: payload.sourceHandle,
        targetHandle: payload.targetHandle,
        label: payload.label,
        style: payload.style ?? { ...DEFAULT_EDGE_STYLE },
      }
      this.document.edges.push(edge)
      this.document.updatedAt = Date.now()
    },
    updateEdge(id: string, updates: Partial<GraphEdge>) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('updateEdge')
      const edge = this.document.edges.find(e => e.id === id)
      if (edge) {
        Object.assign(edge, updates)
        this.document.updatedAt = Date.now()
      }
    },
    removeEdge(id: string) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('removeEdge')
      this.document.edges = this.document.edges.filter(e => e.id !== id)
      this.document.updatedAt = Date.now()
    },
    addGroup(payload: { label: string; x: number; y: number; parentGroupId?: string }) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('addGroup')
      const group: GraphGroup = {
        id: generateGroupId(),
        parentGroupId: payload.parentGroupId,
        label: payload.label,
        collapsed: false,
        x: payload.x,
        y: payload.y,
        childNodeIds: [],
        childGroupIds: [],
      }
      this.document.groups.push(group)
      this.document.updatedAt = Date.now()
    },
    updateGroup(id: string, updates: Partial<GraphGroup>) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('updateGroup')
      const group = this.document.groups.find(g => g.id === id)
      if (group) {
        Object.assign(group, updates)
        this.document.updatedAt = Date.now()
      }
    },
    removeGroup(id: string) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('removeGroup')
      const idsToRemove = new Set<string>()
      const collectGroupIds = (groupId: string) => {
        idsToRemove.add(groupId)
        const group = this.document.groups.find(g => g.id === groupId)
        if (group) {
          for (const childGroupId of group.childGroupIds) {
            collectGroupIds(childGroupId)
          }
        }
      }
      collectGroupIds(id)
      const nodeIdsToRemove = new Set<string>()
      for (const gId of idsToRemove) {
        const group = this.document.groups.find(g => g.id === gId)
        if (group) {
          for (const nId of group.childNodeIds) {
            nodeIdsToRemove.add(nId)
          }
        }
      }
      this.document.edges = this.document.edges.filter(
        e => !nodeIdsToRemove.has(e.sourceId) && !nodeIdsToRemove.has(e.targetId)
      )
      this.document.nodes = this.document.nodes.filter(n => !nodeIdsToRemove.has(n.id))
      this.document.groups = this.document.groups.filter(g => !idsToRemove.has(g.id))
      this.document.updatedAt = Date.now()
    },
    toggleGroupCollapse(id: string) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('toggleGroupCollapse')
      const group = this.document.groups.find(g => g.id === id)
      if (group) {
        group.collapsed = !group.collapsed
        this.document.updatedAt = Date.now()
      }
    },
    setDocument(doc: GraphDocument) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('setDocument')
      this.document = doc
    },
    clearDocument() {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('clearDocument')
      this.document = createEmptyDocument()
    },
    getNodesInRect(rect: Rect): GraphNode[] {
      return this.document.nodes.filter(n =>
        n.x < rect.x + rect.width &&
        n.x + n.width > rect.x &&
        n.y < rect.y + rect.height &&
        n.y + n.height > rect.y
      )
    },
    getNodeById(id: string): GraphNode | undefined {
      return this.document.nodes.find(n => n.id === id)
    },
    getEdgeById(id: string): GraphEdge | undefined {
      return this.document.edges.find(e => e.id === id)
    },
    getGroupById(id: string): GraphGroup | undefined {
      return this.document.groups.find(g => g.id === id)
    },
    groupNodes(nodeIds: string[], label?: string): string | null {
      if (nodeIds.length === 0) return null
      const historyStore = useHistoryStore()
      historyStore.pushHistory('groupNodes')

      const nodes = nodeIds.map(id => this.getNodeById(id)).filter(Boolean) as GraphNode[]
      if (nodes.length === 0) return null

      const minX = Math.min(...nodes.map(n => n.x))
      const minY = Math.min(...nodes.map(n => n.y))
      const maxX = Math.max(...nodes.map(n => n.x + n.width))
      const maxY = Math.max(...nodes.map(n => n.y + n.height))

      const groupId = generateGroupId()
      const group: GraphGroup = {
        id: groupId,
        parentGroupId: undefined,
        label: label || `Group (${nodes.length})`,
        collapsed: false,
        x: minX - 10,
        y: minY - 10,
        childNodeIds: [...nodeIds],
        childGroupIds: [],
      }

      this.document.groups.push(group)

      for (const node of nodes) {
        node.groupId = groupId
      }

      this.document.updatedAt = Date.now()
      return groupId
    },
    ungroupNodes(groupId: string) {
      const historyStore = useHistoryStore()
      historyStore.pushHistory('ungroupNodes')

      const group = this.getGroupById(groupId)
      if (!group) return

      for (const nodeId of group.childNodeIds) {
        const node = this.getNodeById(nodeId)
        if (node) {
          node.groupId = group.parentGroupId
        }
      }

      for (const childGroupId of group.childGroupIds) {
        const childGroup = this.getGroupById(childGroupId)
        if (childGroup) {
          childGroup.parentGroupId = group.parentGroupId
        }
      }

      this.document.groups = this.document.groups.filter(g => g.id !== groupId)
      this.document.updatedAt = Date.now()
    },
    getGroupBoundingBox(groupId: string): { x: number; y: number; width: number; height: number } | null {
      const group = this.getGroupById(groupId)
      if (!group) return null

      if (group.collapsed) {
        return { x: group.x, y: group.y, width: 180, height: 60 }
      }

      const allNodes: GraphNode[] = []
      const collectNodes = (gId: string) => {
        const g = this.getGroupById(gId)
        if (!g) return
        for (const nId of g.childNodeIds) {
          const node = this.getNodeById(nId)
          if (node) allNodes.push(node)
        }
        for (const childGId of g.childGroupIds) {
          collectNodes(childGId)
        }
      }
      collectNodes(groupId)

      if (allNodes.length === 0) {
        return { x: group.x, y: group.y, width: 100, height: 60 }
      }

      const minX = Math.min(...allNodes.map(n => n.x))
      const minY = Math.min(...allNodes.map(n => n.y))
      const maxX = Math.max(...allNodes.map(n => n.x + n.width))
      const maxY = Math.max(...allNodes.map(n => n.y + n.height))

      return {
        x: minX - 15,
        y: minY - 25,
        width: maxX - minX + 30,
        height: maxY - minY + 40,
      }
    },
  },
})
