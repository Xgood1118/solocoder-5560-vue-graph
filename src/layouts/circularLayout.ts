import type { GraphNode, GraphEdge, Point } from '@/types'

export function circularLayout(nodes: GraphNode[], _edges: GraphEdge[]): Map<string, Point> {
  const positions = new Map<string, Point>()
  if (nodes.length === 0) return positions

  const radius = Math.max(200, nodes.length * 40)
  const centerX = radius + 100
  const centerY = radius + 100

  for (let i = 0; i < nodes.length; i++) {
    const angle = (2 * Math.PI * i) / nodes.length
    positions.set(nodes[i].id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })
  }

  return positions
}
