import type { GraphNode, GraphEdge, Point } from '@/types'

export function treeLayout(nodes: GraphNode[], edges: GraphEdge[]): Map<string, Point> {
  const positions = new Map<string, Point>()
  if (nodes.length === 0) return positions

  const nodeMap = new Map<string, GraphNode>()
  for (const n of nodes) nodeMap.set(n.id, n)

  const children = new Map<string, string[]>()
  const hasParent = new Set<string>()
  for (const n of nodes) children.set(n.id, [])
  for (const e of edges) {
    if (nodeMap.has(e.sourceId) && nodeMap.has(e.targetId)) {
      children.get(e.sourceId)!.push(e.targetId)
      hasParent.add(e.targetId)
    }
  }

  const roots = nodes.filter(n => !hasParent.has(n.id))
  if (roots.length === 0) roots.push(nodes[0])

  const visited = new Set<string>()
  const hSpacing = 150
  const vSpacing = 100
  let nextX = 0

  function assignLeafPositions(nodeId: string): { left: number; right: number } {
    if (visited.has(nodeId)) return { left: nextX, right: nextX }
    visited.add(nodeId)

    const kids = children.get(nodeId)!.filter(id => !visited.has(id))

    if (kids.length === 0) {
      const x = nextX
      nextX += hSpacing
      return { left: x, right: x }
    }

    let left = Infinity
    let right = -Infinity
    for (const childId of kids) {
      const range = assignLeafPositions(childId)
      left = Math.min(left, range.left)
      right = Math.max(right, range.right)
    }

    return { left, right }
  }

  function assignPositions(nodeId: string, depth: number): void {
    if (positions.has(nodeId)) return

    const kids = children.get(nodeId)!.filter(id => nodeMap.has(id) && !positions.has(id))

    if (kids.length === 0) {
      positions.set(nodeId, { x: leafX.get(nodeId)!, y: depth * vSpacing })
      return
    }

    for (const childId of kids) {
      assignPositions(childId, depth + 1)
    }

    const childPositions = kids.map(id => positions.get(id)!)
    const minX = Math.min(...childPositions.map(p => p.x))
    const maxX = Math.max(...childPositions.map(p => p.x))

    positions.set(nodeId, { x: (minX + maxX) / 2, y: depth * vSpacing })
  }

  const leafX = new Map<string, number>()

  for (const root of roots) {
    const range = assignLeafPositions(root.id)
    const centerX = (range.left + range.right) / 2
    collectLeafX(root.id, centerX - (range.left + range.right) / 2)
  }

  function collectLeafX(nodeId: string, offsetX: number): void {
    const kids = children.get(nodeId)!.filter(id => nodeMap.has(id))
    if (kids.length === 0) {
      const existing = leafX.get(nodeId)
      if (existing !== undefined) {
        leafX.set(nodeId, existing + offsetX)
      } else {
        leafX.set(nodeId, nextX - hSpacing + offsetX)
      }
      return
    }
    for (const childId of kids) {
      collectLeafX(childId, offsetX)
    }
  }

  for (const root of roots) {
    assignPositions(root.id, 0)
  }

  for (const n of nodes) {
    if (!positions.has(n.id)) {
      positions.set(n.id, { x: nextX, y: 0 })
      nextX += hSpacing
    }
  }

  return positions
}
