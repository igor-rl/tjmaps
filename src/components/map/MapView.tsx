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

  const { layers, setSelectedFeature } = useLayerStore();

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
      });

      const geoJsonData = L.geoJSON(layer.data, {
        style: { color: "#3b82f6", weight: 1.5, fillOpacity: 0.1 },
        onEachFeature: (feature, leafletLayer) => {
          // INTERAÇÃO DE CLIQUE
          leafletLayer.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedFeature({ layerId: layer.id, feature: feature });
          });

          // INTERAÇÃO DE HOVER (NOME AO PASSAR O CURSOR)
          if (feature.properties?.name) {
            leafletLayer.bindTooltip(feature.properties.name, {
              sticky: true, // Segue o mouse
              direction: "top",
              className: "custom-tooltip", // Você pode estilizar isso no CSS global
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

    if (hasVisibleData && totalBounds.isValid()) {
      map.fitBounds(totalBounds, { padding: [40, 40], animate: true });
    }
  }, [layers, setSelectedFeature]);

  return (
    <div ref={mapContainerRef} className="absolute inset-0 bg-slate-950" />
  );
};
