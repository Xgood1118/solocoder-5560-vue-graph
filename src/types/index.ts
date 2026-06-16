export type NodeShape = 'rectangle' | 'ellipse' | 'diamond' | 'hexagon' | 'parallelogram' | 'roundedRect'
export type ArrowDirection = 'unidirectional' | 'bidirectional' | 'none'
export type LineStyle = 'solid' | 'dashed' | 'dotted'
export type Curvature = 'straight' | 'arc' | 'polyline'
export type LayoutAlgorithm = 'force' | 'hierarchical' | 'tree' | 'grid' | 'circular'
export type ThemeName = 'light' | 'dark' | 'print' | 'ocean'
export type ToolMode = 'select' | 'connect' | 'pan'

export interface GraphDocument {
  id: string
  name: string
  templateId?: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  groups: GraphGroup[]
  createdAt: number
  updatedAt: number
}

export interface GraphNode {
  id: string
  groupId?: string
  label: string
  x: number
  y: number
  width: number
  height: number
  shape: NodeShape
  iconRef?: string
  svgContent?: string
  style: NodeStyle
  data: Record<string, string>
  richText?: string
  zIndex: number
}

export interface NodeStyle {
  fillColor: string
  strokeColor: string
  strokeWidth: number
  textColor: string
  fontSize: number
  bold: boolean
  italic: boolean
  underline: boolean
}

export interface GraphEdge {
  id: string
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
  label?: string
  style: EdgeStyle
}

export interface EdgeStyle {
  arrowDirection: ArrowDirection
  lineStyle: LineStyle
  lineWidth: number
  lineColor: string
  curvature: Curvature
}

export interface GraphGroup {
  id: string
  parentGroupId?: string
  label: string
  collapsed: boolean
  x: number
  y: number
  childNodeIds: string[]
  childGroupIds: string[]
}

export interface HistoryEntry {
  timestamp: number
  snapshot: string
  action: string
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface ThemeColors {
  canvasBg: string
  panelBg: string
  panelBorder: string
  textPrimary: string
  textSecondary: string
  accent: string
  accentHover: string
  danger: string
  gridDot: string
  nodeShadow: string
  selectionGlow: string
  miniMapBg: string
  miniMapViewport: string
  toolbarBg: string
  toolbarHover: string
  inputBg: string
  inputBorder: string
}

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface HandlePosition {
  id: string
  x: number
  y: number
  direction: 'top' | 'right' | 'bottom' | 'left'
}

export const DEFAULT_NODE_STYLE: NodeStyle = {
  fillColor: '#3b82f6',
  strokeColor: '#1e40af',
  strokeWidth: 2,
  textColor: '#ffffff',
  fontSize: 14,
  bold: false,
  italic: false,
  underline: false,
}

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  arrowDirection: 'unidirectional',
  lineStyle: 'solid',
  lineWidth: 2,
  lineColor: '#94a3b8',
  curvature: 'straight',
}

export const NODE_SHAPE_LABELS: Record<NodeShape, string> = {
  rectangle: '矩形',
  ellipse: '椭圆',
  diamond: '菱形',
  hexagon: '六边形',
  parallelogram: '平行四边形',
  roundedRect: '圆角矩形',
}

export const LAYOUT_LABELS: Record<LayoutAlgorithm, string> = {
  force: '力导向',
  hierarchical: '层次',
  tree: '树形',
  grid: '网格',
  circular: '圆形',
}
