/**
 * Bridge para o Electron IPC.
 * Em ambiente web (sem Electron), usa localStorage como fallback.
 */

import type { TJLayer } from "../../types/TJLayer"

const isElectron = () =>
  typeof window !== 'undefined' && !!(window as any).electronAPI

// ─── Electron IPC ──────────────────────────────────────────────────────────

const electronSave = async (layer: TJLayer): Promise<void> => {
  const result = await (window as any).electronAPI.saveLayer(layer)
  if (!result.ok) throw new Error(result.error)
}

const electronLoadAll = async (): Promise<TJLayer[]> => {
  const result = await (window as any).electronAPI.loadLayers()
  if (!result.ok) throw new Error(result.error)
  return result.layers as TJLayer[]
}

const electronDelete = async (id: string): Promise<void> => {
  const result = await (window as any).electronAPI.deleteLayer(id)
  if (!result.ok) throw new Error(result.error)
}

// ─── localStorage Fallback (dev web) ───────────────────────────────────────

const LS_KEY = 'tjmaps:layers'

const lsGetAll = (): TJLayer[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

const lsSave = (layer: TJLayer): void => {
  const all = lsGetAll().filter((l) => l.id !== layer.id)
  localStorage.setItem(LS_KEY, JSON.stringify([...all, layer]))
}

const lsDelete = (id: string): void => {
  const all = lsGetAll().filter((l) => l.id !== id)
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}

// ─── Public API ────────────────────────────────────────────────────────────

export const LayerStorage = {
  save: (layer: TJLayer): Promise<void> =>
    isElectron() ? electronSave(layer) : Promise.resolve(lsSave(layer)),

  loadAll: (): Promise<TJLayer[]> =>
    isElectron() ? electronLoadAll() : Promise.resolve(lsGetAll()),

  delete: (id: string): Promise<void> =>
    isElectron() ? electronDelete(id) : Promise.resolve(lsDelete(id)),
}