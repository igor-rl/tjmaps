import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { MapProviders } from "../../services/map/mapProvider";
import { useLayerStore } from "../../store/useLayerStore";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const geoJsonLayerToLayers = (
  source: L.GeoJSON,
  cluster: L.MarkerClusterGroup,
) => {
  source.eachLayer((l) => cluster.addLayer(l));
};

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
  const maskOverlayRef = useRef<HTMLDivElement | null>(null);

  const { layers, selectedFeature, setSelectedFeature } = useLayerStore();

  // Inicialização do Mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false,
      renderer: L.canvas({ padding: 0.1 }),
    });
    MapProviders.getSatelliteLayer().addTo(map);
    mapInstanceRef.current = map;
    map.on("click", () => setSelectedFeature(null));
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setSelectedFeature]);

  // Sincronização de camadas (Apenas baseado no botão de visibilidade da Sidebar)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const totalBounds = L.latLngBounds([]);
    let hasVisibleData = false;

    // Remove camadas deletadas
    Object.keys(leafletLayersRef.current).forEach((id) => {
      if (!layers.find((l) => l.id === id)) {
        map.removeLayer(leafletLayersRef.current[id]);
        delete leafletLayersRef.current[id];
      }
    });

    layers.forEach((layer) => {
      // Sempre limpa para evitar duplicatas ao atualizar
      if (leafletLayersRef.current[layer.id]) {
        map.removeLayer(leafletLayersRef.current[layer.id]);
      }

      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 30,
        disableClusteringAtZoom: 18,
      });

      const geoJsonData = L.geoJSON(layer.data, {
        style: {
          color: "#3b82f6",
          weight: 1.5,
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

      // Segue apenas a visibilidade da Sidebar
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

  // Spotlight mask + Navegação (Versão Nativa com Inverted Polygon)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const removeMask = () => {
      if (maskOverlayRef.current) {
        map.removeLayer(maskOverlayRef.current as any);
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
      removeMask();

      // Coordenadas do "Mundo Inteiro" para criar a máscara externa
      const worldOuter = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
      ];

      // Coordenadas do território (o buraco)
      // O Leaflet aceita [lat, lng], então invertemos o [lng, lat] do GeoJSON
      const featureCoords =
        feature.geometry.type === "Polygon"
          ? feature.geometry.coordinates
          : feature.geometry.coordinates[0];

      const holeCoords = featureCoords.map((ring: number[][]) =>
        ring.map((coord) => [coord[1], coord[0]]),
      );

      // Cria um polígono onde o primeiro array é o limite externo (mundo)
      // e os subsequentes são os "buracos"
      const mask = L.polygon([worldOuter, ...holeCoords], {
        color: "transparent",
        fillColor: "black",
        fillOpacity: 0.72,
        interactive: false, // Permite clicar através da máscara
        className: "spotlight-mask",
      }).addTo(map);

      maskOverlayRef.current = mask as any;
    }

    // Navegação flyTo (Mantido)
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

    return () => removeMask();
  }, [selectedFeature]);

  return (
    <div ref={mapContainerRef} className="absolute inset-0 bg-slate-950" />
  );
};
