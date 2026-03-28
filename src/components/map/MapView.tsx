import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { MapProviders } from "../../services/map/mapProvider";
import { useLayerStore } from "../../store/useLayerStore";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Helper para converter GeoJSON em camadas de Cluster
const geoJsonLayerToLayers = (
  source: L.GeoJSON,
  cluster: L.MarkerClusterGroup,
) => {
  source.eachLayer((l) => cluster.addLayer(l));
};

// Helper para pegar limites de um grupo (MarkerCluster ou LayerGroup)
const getGroupBounds = (group: L.LayerGroup): L.LatLngBounds => {
  if ("getBounds" in group && typeof (group as any).getBounds === "function") {
    return (group as any).getBounds();
  }
  return L.latLngBounds([]);
};

export const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const leafletLayersRef = useRef<Record<string, L.LayerGroup>>({});
  const maskOverlayRef = useRef<L.Polygon | null>(null);

  // IMPORTANTE: Pegamos o isPrinting do Store
  const { layers, selectedFeature, setSelectedFeature, isPrinting } =
    useLayerStore();

  // 1. Inicialização do Mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false,
      renderer: L.canvas({ padding: 0.1 }),
      fadeAnimation: true,
    });

    MapProviders.getSatelliteLayer().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setSelectedFeature]);

  // 2. Sincronização de Camadas e Visibilidade
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const totalBounds = L.latLngBounds([]);
    let hasVisibleData = false;

    Object.keys(leafletLayersRef.current).forEach((id) => {
      if (!layers.find((l) => l.id === id)) {
        map.removeLayer(leafletLayersRef.current[id]);
        delete leafletLayersRef.current[id];
      }
    });

    layers.forEach((layer) => {
      if (leafletLayersRef.current[layer.id]) {
        map.removeLayer(leafletLayersRef.current[layer.id]);
      }

      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 30,
        disableClusteringAtZoom: 18,
        spiderfyOnMaxZoom: true,
      });

      const geoJsonData = L.geoJSON(layer.data, {
        style: {
          color: "#3b82f6",
          weight: 2,
          fillOpacity: 0,
          opacity: 1,
        },
        onEachFeature: (feature, leafletLayer) => {
          leafletLayer.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedFeature({ layerId: layer.id, feature });
          });

          if (feature.properties?.name) {
            leafletLayer.bindTooltip(feature.properties.name, {
              sticky: true,
              direction: "top",
              className: "custom-tooltip",
            });
          }
        },
      });

      geoJsonLayerToLayers(geoJsonData, clusterGroup);
      leafletLayersRef.current[layer.id] = clusterGroup;

      if (layer.visible) {
        map.addLayer(clusterGroup);
        const layerBounds = getGroupBounds(clusterGroup);
        if (layerBounds.isValid()) {
          totalBounds.extend(layerBounds);
          hasVisibleData = true;
        }
      }
    });

    if (hasVisibleData && totalBounds.isValid() && !selectedFeature) {
      map.fitBounds(totalBounds, { padding: [40, 40], animate: true });
    }
  }, [layers, selectedFeature, setSelectedFeature]);

  // 3. Spotlight Mask + Navegação
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const removeMask = () => {
      if (maskOverlayRef.current) {
        map.removeLayer(maskOverlayRef.current);
        maskOverlayRef.current = null;
      }
    };

    if (!selectedFeature) {
      removeMask();
      return;
    }

    const { feature } = selectedFeature;
    const isPolygon = feature.geometry.type.includes("Polygon");

    if (isPolygon) {
      // IMPORTANTE: Não removemos mais a máscara se estiver imprimindo.
      // Apenas limpamos a anterior para desenhar a nova/atualizada.
      removeMask();

      // Máscara Mundial
      const worldOuter = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
      ];

      const featureCoords =
        feature.geometry.type === "Polygon"
          ? feature.geometry.coordinates
          : feature.geometry.coordinates[0];

      const holeCoords = featureCoords.map((ring: number[][]) =>
        ring.map((coord: number[]) => [coord[1], coord[0]]),
      );

      // Criamos a máscara.
      // DICA: Se o mapa ficar escuro demais no S-12, podemos baixar o fillOpacity aqui para 0.4
      const mask = L.polygon([worldOuter, ...holeCoords], {
        color: "transparent",
        fillColor: "black",
        fillOpacity: 0.4,
        interactive: false,
        className: "spotlight-mask",
      }).addTo(map);

      maskOverlayRef.current = mask;
    }

    // Navegação flyTo: Só dispara se NÃO estivermos no meio de uma impressão
    // para não "roubar" o zoom que o usuário ajustou manualmente no visor.
    if (!isPrinting) {
      const { geometry } = feature;
      if (geometry.type === "Point") {
        const [lng, lat] = geometry.coordinates;
        map.flyTo([lat, lng], 18, { animate: true, duration: 1.2 });
      } else {
        const tempLayer = L.geoJSON(feature);
        const bounds = tempLayer.getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [60, 60],
            maxZoom: 17,
            animate: true,
            duration: 1.2,
          });
        }
      }
    }

    return () => removeMask();
  }, [selectedFeature, isPrinting]); // Monitora ambos para decidir o comportamento

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 bg-slate-950 z-0"
      style={{ cursor: "grab" }}
    />
  );
};
