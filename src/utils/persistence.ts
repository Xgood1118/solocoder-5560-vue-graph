import type { GraphDocument } from '@/types'

const DB_NAME = 'graph-editor-db'
const DB_VERSION = 1
const STORE_NAME = 'documents'

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveDocument(doc: GraphDocument): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(doc)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadDocument(id: string): Promise<GraphDocument | null> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function listDocuments(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => {
      const results = (request.result as GraphDocument[]).map((doc) => ({
        id: doc.id,
        name: doc.name,
        updatedAt: doc.updatedAt,
      }))
      resolve(results)
    }
    request.onerror = () => reject(request.error)
  })
}

const PREF_PREFIX = 'ge-pref-'

export function savePreference(key: string, value: string): void {
  localStorage.setItem(PREF_PREFIX + key, value)
}

export function loadPreference(key: string): string | null {
  return localStorage.getItem(PREF_PREFIX + key)
}
