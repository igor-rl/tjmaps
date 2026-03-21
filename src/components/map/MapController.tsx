import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useLayerStore } from "../../store/useLayerStore";
import L from "leaflet";

export const MapController = () => {
  const map = useMap();
  const selectedFeature = useLayerStore((state: any) => state.selectedFeature);

  useEffect(() => {
    if (!selectedFeature || !selectedFeature.feature) return;

    try {
      const { feature } = selectedFeature;
      const tempLayer = L.geoJSON(feature);
      const bounds = tempLayer.getBounds();

      if (bounds.isValid()) {
        map.invalidateSize();
        if (feature.geometry.type === "Point") {
          map.flyTo(bounds.getCenter(), 18, { animate: true, duration: 1.2 });
        } else {
          map.flyToBounds(bounds, {
            padding: [80, 80],
            maxZoom: 17,
            animate: true,
            duration: 1.2,
          });
        }
      }
    } catch (error) {
      console.error("Erro na navegação do mapa:", error);
    }
  }, [selectedFeature, map]);

  return null;
};
