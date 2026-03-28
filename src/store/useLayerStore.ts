import { create } from 'zustand'
import type { TJLayer, TJFeature } from '../types/TJLayer'
import { LayerStorage } from '../services/storage/layerStorage'

interface SelectedFeature {
  layerId: string
  feature: TJFeature
}

interface LayerState {
  layers: TJLayer[]
  selectedFeature: SelectedFeature | null
  isPrinting: boolean
  isBooting: boolean

  // Boot
  bootLayers: () => Promise<void>

  // Layer actions
  addLayer: (layer: TJLayer) => Promise<void>
  toggleVisibility: (id: string) => Promise<void>
  removeLayer: (id: string) => Promise<void>

  // Feature actions
  setSelectedFeature: (selection: SelectedFeature | null) => void
  updateFeature: (layerId: string, featureId: string, patch: Partial<Pick<TJFeature, 'name' | 'number' | 'notes'>>) => Promise<void>
  deleteFeature: (layerId: string, featureId: string) => Promise<void>
  reorderFeatures: (layerId: string, features: TJFeature[]) => Promise<void>

  // Print mode
  setPrinting: (val: boolean) => void
}

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: [],
  selectedFeature: null,
  isPrinting: false,
  isBooting: true,

  // ── Boot ──────────────────────────────────────────────────────────────────
  bootLayers: async () => {
    try {
      const layers = await LayerStorage.loadAll()
      // Ordena por timestamp de criação
      layers.sort((a, b) => a.timestamp - b.timestamp)
      set({ layers, isBooting: false })
    } catch (err) {
      console.error('Erro ao carregar layers:', err)
      set({ isBooting: false })
    }
  },

  // ── Layer actions ─────────────────────────────────────────────────────────
  addLayer: async (layer) => {
    // Evita duplicatas pelo id
    if (get().layers.some((l) => l.id === layer.id)) return
    set((state) => ({ layers: [...state.layers, layer] }))
    await LayerStorage.save(layer)
  },

  toggleVisibility: async (id) => {
    let updated: TJLayer | undefined
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== id) return l
        updated = { ...l, visible: !l.visible }
        return updated
      }),
    }))
    if (updated) await LayerStorage.save(updated)
  },

  removeLayer: async (id) => {
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedFeature:
        state.selectedFeature?.layerId === id ? null : state.selectedFeature,
    }))
    await LayerStorage.delete(id)
  },

  // ── Feature actions ───────────────────────────────────────────────────────
  setSelectedFeature: (selection) => set({ selectedFeature: selection }),

  updateFeature: async (layerId, featureId, patch) => {
    let updated: TJLayer | undefined
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l
        updated = {
          ...l,
          features: l.features.map((f) =>
            f.id === featureId ? { ...f, ...patch } : f,
          ),
        }
        return updated
      }),
      // Atualiza também a selectedFeature para refletir o novo nome/notas imediatamente
      selectedFeature:
        state.selectedFeature?.layerId === layerId &&
        state.selectedFeature.feature.id === featureId
          ? {
              ...state.selectedFeature,
              feature: { ...state.selectedFeature.feature, ...patch },
            }
          : state.selectedFeature,
    }))
    if (updated) await LayerStorage.save(updated)
  },

  deleteFeature: async (layerId, featureId) => {
    let updated: TJLayer | undefined
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l
        updated = {
          ...l,
          features: l.features.filter((f) => f.id !== featureId),
        }
        return updated
      }),
      selectedFeature: null,
    }))
    if (updated) await LayerStorage.save(updated)
  },

  reorderFeatures: async (layerId, features) => {
    let updated: TJLayer | undefined
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l
        updated = { ...l, features }
        return updated
      }),
    }))
    if (updated) await LayerStorage.save(updated)
  },

  // ── Print mode ────────────────────────────────────────────────────────────
  setPrinting: (val) => set({ isPrinting: val }),
}))