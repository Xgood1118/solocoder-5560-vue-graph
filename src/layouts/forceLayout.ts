import type { GraphNode, GraphEdge, Point } from '@/types'

export function forceLayout(nodes: GraphNode[], edges: GraphEdge[]): Map<string, Point> {
  const positions = new Map<string, Point>()
  if (nodes.length === 0) return positions

  const allZero = nodes.every(n => n.x === 0 && n.y === 0)
  const pos = nodes.map(n => ({
    id: n.id,
    x: allZero ? Math.random() * 800 : n.x,
    y: allZero ? Math.random() * 600 : n.y,
    vx: 0,
    vy: 0,
  }))

  const indexMap = new Map<string, number>()
  pos.forEach((p, i) => indexMap.set(p.id, i))

  const k = 80
  let alpha = 1

  for (let iter = 0; iter < 300; iter++) {
    for (let i = 0; i < pos.length; i++) {
      pos[i].vx = 0
      pos[i].vy = 0
    }

    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[j].x - pos[i].x
        const dy = pos[j].y - pos[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (k * k) / dist
        const fx = (dx / dist) * force * alpha
        const fy = (dy / dist) * force * alpha
        pos[i].vx -= fx
        pos[i].vy -= fy
        pos[j].vx += fx
        pos[j].vy += fy
      }
    }

    for (const edge of edges) {
      const si = indexMap.get(edge.sourceId)
      const ti = indexMap.get(edge.targetId)
      if (si === undefined || ti === undefined) continue
      const dx = pos[ti].x - pos[si].x
      const dy = pos[ti].y - pos[si].y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const force = (dist * dist) / k
      const fx = (dx / dist) * force * alpha
      const fy = (dy / dist) * force * alpha
      pos[si].vx += fx
      pos[si].vy += fy
      pos[ti].vx -= fx
      pos[ti].vy -= fy
    }

    for (let i = 0; i < pos.length; i++) {
      const disp = Math.sqrt(pos[i].vx * pos[i].vx + pos[i].vy * pos[i].vy) || 0
      if (disp > 0) {
        const capped = Math.min(disp, 10)
        pos[i].x += (pos[i].vx / disp) * capped
        pos[i].y += (pos[i].vy / disp) * capped
      }
    }

    alpha *= 0.995
  }

  for (const p of pos) {
    positions.set(p.id, { x: p.x, y: p.y })
  }

  return positions
}
