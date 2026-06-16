import type { GraphNode, GraphEdge, Point } from '@/types'

export function gridLayout(nodes: GraphNode[], _edges: GraphEdge[]): Map<string, Point> {
  const positions = new Map<string, Point>()
  if (nodes.length === 0) return positions

  const columns = Math.ceil(Math.sqrt(nodes.length))

  for (let i = 0; i < nodes.length; i++) {
    const col = i % columns
    const row = Math.floor(i / columns)
    positions.set(nodes[i].id, {
      x: col * 180 + 50,
      y: row * 120 + 50,
    })
  }

  return positions
}
