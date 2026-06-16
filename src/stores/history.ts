import { defineStore } from 'pinia'
import type { HistoryEntry } from '@/types'
import { useGraphStore } from './graph'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    undoStack: [] as HistoryEntry[],
    redoStack: [] as HistoryEntry[],
  }),
  getters: {
    canUndo: (state) => state.undoStack.length > 0,
    canRedo: (state) => state.redoStack.length > 0,
  },
  actions: {
    pushHistory(action: string) {
      const graphStore = useGraphStore()
      const entry: HistoryEntry = {
        timestamp: Date.now(),
        snapshot: JSON.stringify(graphStore.document),
        action,
      }
      this.undoStack.push(entry)
      this.redoStack = []
      if (this.undoStack.length > 50) {
        this.undoStack.shift()
      }
    },
    undo() {
      if (this.undoStack.length === 0) return
      const graphStore = useGraphStore()
      const currentEntry: HistoryEntry = {
        timestamp: Date.now(),
        snapshot: JSON.stringify(graphStore.document),
        action: 'undo',
      }
      this.redoStack.push(currentEntry)
      const entry = this.undoStack.pop()!
      graphStore.document = JSON.parse(entry.snapshot)
    },
    redo() {
      if (this.redoStack.length === 0) return
      const graphStore = useGraphStore()
      const currentEntry: HistoryEntry = {
        timestamp: Date.now(),
        snapshot: JSON.stringify(graphStore.document),
        action: 'redo',
      }
      this.undoStack.push(currentEntry)
      const entry = this.redoStack.pop()!
      graphStore.document = JSON.parse(entry.snapshot)
    },
  },
})
