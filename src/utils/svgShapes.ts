import type { NodeShape, GraphNode, HandlePosition } from '@/types'

export function getShapePath(shape: NodeShape, width: number, height: number): string {
  switch (shape) {
    case 'rectangle':
      return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`
    case 'ellipse': {
      const cx = width / 2
      const cy = height / 2
      const rx = width / 2
      const ry = height / 2
      return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`
    }
    case 'diamond':
      return `M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`
    case 'hexagon': {
      const hw = width / 2
      const hh = height / 2
      const qx = width / 4
      return `M ${qx} 0 L ${qx * 3} 0 L ${width} ${hh} L ${qx * 3} ${height} L ${qx} ${height} L 0 ${hh} Z`
    }
    case 'parallelogram': {
      const offset = 20
      return `M ${offset} 0 L ${width} 0 L ${width - offset} ${height} L 0 ${height} Z`
    }
    case 'roundedRect':
      return `M 12 0 L ${width - 12} 0 Q ${width} 0 ${width} 12 L ${width} ${height - 12} Q ${width} ${height} ${width - 12} ${height} L 12 ${height} Q 0 ${height} 0 ${height - 12} L 0 12 Q 0 0 12 0 Z`
    default:
      return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`
  }
}

export function getShapeClipPathId(nodeId: string): string {
  return `clip-${nodeId}`
}

export function getNodeHandles(node: GraphNode): HandlePosition[] {
  const { id, width, height } = node
  return [
    { id: `${id}-top`, x: width / 2, y: 0, direction: 'top' },
    { id: `${id}-right`, x: width, y: height / 2, direction: 'right' },
    { id: `${id}-bottom`, x: width / 2, y: height, direction: 'bottom' },
    { id: `${id}-left`, x: 0, y: height / 2, direction: 'left' },
  ]
}
