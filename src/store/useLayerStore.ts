import { create } from "zustand";
import type { ProcessedKml } from "../services/geo/kmlService";

export interface MapLayer extends ProcessedKml {
  visible: boolean;
}

interface LayerState {
  layers: MapLayer[];
  addLayer: (layer: ProcessedKml) => void;
  toggleVisibility: (id: string) => void;
  removeLayer: (id: string) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: [],

  addLayer: (layer) =>
    set((state) => {
      // Evita duplicar a mesma camada pelo fileName
      if (state.layers.some((l) => l.fileName === layer.fileName)) {
        return state;
      }
      return { layers: [...state.layers, { ...layer, visible: true }] };
    }),

  toggleVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l,
      ),
    })),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
    })),
}));
