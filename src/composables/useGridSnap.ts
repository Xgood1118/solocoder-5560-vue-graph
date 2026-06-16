const GRID_SIZE = 20

export function useGridSnap() {
  function snapToGrid(value: number): number {
    return Math.round(value / GRID_SIZE) * GRID_SIZE
  }

  function snapPoint(x: number, y: number): { x: number; y: number } {
    return {
      x: snapToGrid(x),
      y: snapToGrid(y),
    }
  }

  return { snapToGrid, snapPoint }
}
