import type { GraphDocument } from '@/types'

const DB_NAME = 'graph-editor-db-v2'
const DB_VERSION = 2
const STORE_NAME = 'documents'
const LS_DOC_PREFIX = 'gedoc:'
const LS_CURRENT_DOC = 'ge:currentDoc'
const LS_CURRENT_ID = 'ge:currentId'

let dbPromise: Promise<IDBDatabase> | null = null

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    try {
      if (!window.indexedDB) {
        reject(new Error('indexedDB unavailable'))
        return
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }
      request.onsuccess = () => {
        const db = request.result
        db.onclose = () => { dbPromise = null }
        db.onerror = () => { dbPromise = null }
        db.onabort = () => { dbPromise = null }
        resolve(db)
      }
      request.onerror = () => {
        dbPromise = null
        reject(request.error)
      }
      request.onblocked = () => {
        dbPromise = null
        reject(new Error('IDB blocked'))
      }
    } catch (e) {
      dbPromise = null
      reject(e)
    }
  })
  return dbPromise
}

function safeSerialize(doc: GraphDocument): string {
  try {
    const plain = JSON.parse(JSON.stringify(doc))
    return JSON.stringify(plain)
  } catch (e) {
    console.error('[persistence] serialize failed', e)
    throw e
  }
}

function safeDeserialize(str: string): GraphDocument | null {
  try {
    const data = JSON.parse(str)
    if (!data || typeof data !== 'object') return null
    if (!data.id || !Array.isArray(data.nodes) || !Array.isArray(data.edges) || !Array.isArray(data.groups)) return null
    return data as GraphDocument
  } catch {
    return null
  }
}

function writeLocalStorage(doc: GraphDocument) {
  try {
    const serialized = safeSerialize(doc)
    try { localStorage.setItem(LS_DOC_PREFIX + doc.id, serialized) } catch {}
    try { localStorage.setItem(LS_CURRENT_DOC, serialized) } catch {}
    try { localStorage.setItem(LS_CURRENT_ID, doc.id) } catch {}
  } catch {}
}

function readFromLocalStorage(id: string): GraphDocument | null {
  const byId = localStorage.getItem(LS_DOC_PREFIX + id)
  if (byId) {
    const doc = safeDeserialize(byId)
    if (doc) return doc
  }
  const current = localStorage.getItem(LS_CURRENT_DOC)
  if (current) {
    const doc = safeDeserialize(current)
    if (doc && doc.id === id) return doc
  }
  return null
}

function readCurrentFromLocalStorage(): GraphDocument | null {
  const current = localStorage.getItem(LS_CURRENT_DOC)
  if (current) return safeDeserialize(current)
  return null
}

async function writeToIDB(doc: GraphDocument, serialized: string): Promise<boolean> {
  try {
    const db = await openDatabase()
    return await new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const data = JSON.parse(serialized)
        const req = store.put(data)
        req.onsuccess = () => resolve(true)
        req.onerror = () => resolve(false)
        tx.onerror = () => resolve(false)
        tx.onabort = () => resolve(false)
      } catch {
        resolve(false)
      }
    })
  } catch {
    return false
  }
}

async function readFromIDB(id: string): Promise<GraphDocument | null> {
  try {
    const db = await openDatabase()
    return await new Promise<GraphDocument | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.get(id)
        req.onsuccess = () => {
          const data = req.result
          if (!data) resolve(null)
          else if (data.id && Array.isArray(data.nodes) && Array.isArray(data.edges)) resolve(data as GraphDocument)
          else resolve(null)
        }
        req.onerror = () => resolve(null)
        tx.onerror = () => resolve(null)
      } catch {
        resolve(null)
      }
    })
  } catch {
    return null
  }
}

export async function saveDocument(doc: GraphDocument): Promise<void> {
  const serialized = safeSerialize(doc)
  writeLocalStorage(doc)
  await writeToIDB(doc, serialized)
}

export async function loadDocument(id: string): Promise<GraphDocument | null> {
  let result: GraphDocument | null = await readFromIDB(id)
  if (!result) result = readFromLocalStorage(id)
  if (!result) {
    const cur = readCurrentFromLocalStorage()
    if (cur && cur.id === id) result = cur
  }
  if (result) {
    try { localStorage.setItem(LS_CURRENT_ID, result.id) } catch {}
  }
  return result
}

export async function deleteDocument(id: string): Promise<void> {
  try { localStorage.removeItem(LS_DOC_PREFIX + id) } catch {}
  try {
    const curId = localStorage.getItem(LS_CURRENT_ID)
    if (curId === id) localStorage.removeItem(LS_CURRENT_DOC)
  } catch {}
  try {
    const db = await openDatabase()
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const req = tx.objectStore(STORE_NAME).delete(id)
        req.onsuccess = () => resolve()
        req.onerror = () => resolve()
        tx.onerror = () => resolve()
      } catch { resolve() }
    })
  } catch {}
}

export async function listDocuments(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
  const seen = new Map<string, { id: string; name: string; updatedAt: number }>()

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(LS_DOC_PREFIX)) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const doc = safeDeserialize(raw)
          if (doc) seen.set(doc.id, { id: doc.id, name: doc.name, updatedAt: doc.updatedAt })
        }
      }
    }
  } catch {}

  try {
    const db = await openDatabase()
    const idbResults = await new Promise<Array<{ id: string; name: string; updatedAt: number }>>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const req = tx.objectStore(STORE_NAME).getAll()
        req.onsuccess = () => {
          const arr = (req.result as GraphDocument[] || [])
            .filter(d => d && d.id)
            .map(d => ({ id: d.id, name: d.name, updatedAt: d.updatedAt || 0 }))
          resolve(arr)
        }
        req.onerror = () => resolve([])
      } catch { resolve([]) }
    })
    for (const r of idbResults) seen.set(r.id, r)
  } catch {}

  return Array.from(seen.values()).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getCurrentDocumentId(): string | null {
  try {
    return localStorage.getItem(LS_CURRENT_ID)
  } catch {
    return null
  }
}

export function saveCurrentDocumentId(id: string): void {
  try {
    localStorage.setItem(LS_CURRENT_ID, id)
  } catch {}
}

const PREF_PREFIX = 'ge-pref-'

export function savePreference(key: string, value: string): void {
  try { localStorage.setItem(PREF_PREFIX + key, value) } catch {}
}

export function loadPreference(key: string): string | null {
  try { return localStorage.getItem(PREF_PREFIX + key) } catch { return null }
}
