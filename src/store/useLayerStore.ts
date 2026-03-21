import { create } from "zustand";
import type { ProcessedKml } from "../services/geo/kmlService";

export interface MapLayer extends ProcessedKml {
  visible: boolean;
}
interface SelectedFeature {
  layerId: string;
  feature: any;
}

interface LayerState {
  layers: MapLayer[];
  selectedFeature: SelectedFeature | null;
  addLayer: (layer: ProcessedKml) => void;
  toggleVisibility: (id: string) => void;
  removeLayer: (id: string) => void;
  setSelectedFeature: (selection: SelectedFeature | null) => void;
  updateFeature: (layerId: string, featureId: string, properties: any) => void;
  deleteFeature: (layerId: string, featureId: string) => void;
}

export const useLayerStore = create<LayerState>((set) => ({
  layers: [],
  selectedFeature: null,
  addLayer: (layer) =>
    set((state) => {
      if (state.layers.some((l) => l.fileName === layer.fileName)) return state;
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
      selectedFeature:
        state.selectedFeature?.layerId === id ? null : state.selectedFeature,
    })),
  setSelectedFeature: (selection) => set({ selectedFeature: selection }),
  updateFeature: (layerId, featureId, newProperties) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l;
        return {
          ...l,
          data: {
            ...l.data,
            features: l.data.features.map((f: any) =>
              f.id === featureId || f.properties?.id === featureId
                ? { ...f, properties: { ...f.properties, ...newProperties } }
                : f,
            ),
          },
        };
      }),
    })),
  deleteFeature: (layerId, featureId) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l;
        return {
          ...l,
          data: {
            ...l.data,
            features: l.data.features.filter(
              (f: any) => f.id !== featureId && f.properties?.id !== featureId,
            ),
          },
        };
      }),
      selectedFeature: null,
    })),
}));
