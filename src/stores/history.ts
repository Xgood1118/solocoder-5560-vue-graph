import { defineStore } from 'pinia'
import type { HistoryEntry } from '@/types'
import { useGraphStore } from './graph'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    undoStack: [] as HistoryEntry[],
    redoStack: [] as HistoryEntry[],
    pauseRecording: false,
    _lockRestore: false,
    _lastSnapshot: '' as string,
  }),
  getters: {
    canUndo: (state) => state.undoStack.length > 0,
    canRedo: (state) => state.redoStack.length > 0,
  },
  actions: {
    pushHistory(action: string) {
      if (this.pauseRecording || this._lockRestore) return
      const graphStore = useGraphStore()
      let snapshot = ''
      try {
        snapshot = JSON.stringify(graphStore.document)
      } catch {
        return
      }
      if (snapshot && snapshot === this._lastSnapshot) return
      this._lastSnapshot = snapshot
      const entry: HistoryEntry = {
        timestamp: Date.now(),
        snapshot,
        action,
      }
      this.undoStack.push(entry)
      this.redoStack = []
      if (this.undoStack.length > 50) {
        this.undoStack.shift()
      }
    },
    undo() {
      if (this.undoStack.length === 0 || this.pauseRecording) return
      const graphStore = useGraphStore()
      this._lockRestore = true
      try {
        const currentSnapshot = JSON.stringify(graphStore.document)
        this.redoStack.push({
          timestamp: Date.now(),
          snapshot: currentSnapshot,
          action: 'undo',
        })
        const entry = this.undoStack.pop()!
        this._lastSnapshot = entry.snapshot
        graphStore.document = JSON.parse(entry.snapshot)
      } catch {}
      this._lockRestore = false
    },
    redo() {
      if (this.redoStack.length === 0 || this.pauseRecording) return
      const graphStore = useGraphStore()
      this._lockRestore = true
      try {
        const currentSnapshot = JSON.stringify(graphStore.document)
        this.undoStack.push({
          timestamp: Date.now(),
          snapshot: currentSnapshot,
          action: 'redo',
        })
        const entry = this.redoStack.pop()!
        this._lastSnapshot = entry.snapshot
        graphStore.document = JSON.parse(entry.snapshot)
      } catch {}
      this._lockRestore = false
    },
    clear() {
      this.undoStack = []
      this.redoStack = []
      this._lastSnapshot = ''
      this._lockRestore = false
    },
  },
})
