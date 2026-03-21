import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { MapProviders } from "../../services/map/mapProvider";
import { useLayerStore } from "../../store/useLayerStore";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// --- FUNÇÕES AUXILIARES (Fora do componente para evitar hoisting e re-render) ---

const geoJsonLayerToLayers = (
  source: L.GeoJSON,
  cluster: L.MarkerClusterGroup,
) => {
  source.eachLayer((l) => {
    // Adiciona tudo ao cluster (o plugin cuida de diferenciar polígono de marcador)
    cluster.addLayer(l);
  });
};

const getGroupBounds = (group: L.LayerGroup): L.LatLngBounds => {
  if ("getBounds" in group && typeof (group as any).getBounds === "function") {
    return (group as any).getBounds();
  }
  return L.latLngBounds([]);
};

// --- COMPONENTE PRINCIPAL ---

export const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const leafletLayersRef = useRef<Record<string, L.LayerGroup>>({});

  const layers = useLayerStore((state) => state.layers);

  // 1. Inicialização do Mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false,
      renderer: L.canvas({ padding: 0.5 }),
    });

    MapProviders.getSatelliteLayer().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Sincronização e Zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const totalBounds = L.latLngBounds([]);
    let hasVisibleData = false;

    layers.forEach((layer) => {
      // Cria a instância se não existir
      if (!leafletLayersRef.current[layer.id]) {
        const clusterGroup = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 40,
          disableClusteringAtZoom: 17,
        });

        const geoJsonData = L.geoJSON(layer.data, {
          style: {
            color: "#3b82f6",
            weight: 2,
            fillOpacity: 0.15,
          },
          onEachFeature: (feature, leafletLayer) => {
            if (feature.properties?.name) {
              leafletLayer.bindPopup(`<b>${feature.properties.name}</b>`);
            }
          },
        });

        // Agora as funções estão disponíveis aqui
        geoJsonLayerToLayers(geoJsonData, clusterGroup);
        leafletLayersRef.current[layer.id] = clusterGroup;
      }

      const leafletLayer = leafletLayersRef.current[layer.id];

      if (layer.visible) {
        if (!map.hasLayer(leafletLayer)) {
          map.addLayer(leafletLayer);
        }

        const layerBounds = getGroupBounds(leafletLayer);
        if (layerBounds.isValid()) {
          totalBounds.extend(layerBounds);
          hasVisibleData = true;
        }
      } else {
        if (map.hasLayer(leafletLayer)) {
          map.removeLayer(leafletLayer);
        }
      }
    });

    if (hasVisibleData && totalBounds.isValid()) {
      map.fitBounds(totalBounds, {
        padding: [50, 50],
        animate: true,
        duration: 1.5,
      });
    }
  }, [layers]);

  return (
    <div ref={mapContainerRef} className="absolute inset-0 bg-slate-950" />
  );
};
