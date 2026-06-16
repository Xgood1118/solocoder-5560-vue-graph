import type { GraphNode, GraphEdge, Point } from '@/types'

export function hierarchicalLayout(nodes: GraphNode[], edges: GraphEdge[]): Map<string, Point> {
  const positions = new Map<string, Point>()
  if (nodes.length === 0) return positions

  const nodeMap = new Map<string, GraphNode>()
  for (const n of nodes) nodeMap.set(n.id, n)

  const incoming = new Map<string, string[]>()
  for (const n of nodes) incoming.set(n.id, [])
  for (const e of edges) {
    if (nodeMap.has(e.sourceId) && nodeMap.has(e.targetId)) {
      incoming.get(e.targetId)!.push(e.sourceId)
    }
  }

  const sources = nodes.filter(n => incoming.get(n.id)!.length === 0)
  if (sources.length === 0) sources.push(nodes[0])

  const layer = new Map<string, number>()
  const queue: string[] = sources.map(s => s.id)
  for (const id of queue) layer.set(id, 0)

  const visited = new Set<string>(queue)
  let head = 0
  while (head < queue.length) {
    const current = queue[head++]
    const currentLayer = layer.get(current)!
    for (const e of edges) {
      if (e.sourceId === current && nodeMap.has(e.targetId)) {
        const targetLayer = currentLayer + 1
        const existing = layer.get(e.targetId)
        if (existing === undefined || existing < targetLayer) {
          layer.set(e.targetId, targetLayer)
        }
        if (!visited.has(e.targetId)) {
          visited.add(e.targetId)
          queue.push(e.targetId)
        }
      }
    }
  }

  for (const n of nodes) {
    if (!layer.has(n.id)) layer.set(n.id, 0)
  }

  const layers = new Map<number, string[]>()
  for (const [id, l] of layer) {
    if (!layers.has(l)) layers.set(l, [])
    layers.get(l)!.push(id)
  }

  const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0])
  const hSpacing = 150
  const vSpacing = 120

  for (const [, nodeIds] of sortedLayers) {
    const layerIndex = sortedLayers.findIndex(e => e[1] === nodeIds)
    const totalWidth = (nodeIds.length - 1) * hSpacing
    const startX = -totalWidth / 2
    for (let i = 0; i < nodeIds.length; i++) {
      positions.set(nodeIds[i], {
        x: startX + i * hSpacing,
        y: layerIndex * vSpacing,
      })
    }
  }

  return positions
}
