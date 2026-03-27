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

// Converte coordenadas GeoJSON de um polígono para string SVG path
const polygonToSvgPath = (map: L.Map, coordinates: number[][][]): string => {
  return coordinates
    .map((ring) => {
      return (
        ring
          .map((coord, i) => {
            const point = map.latLngToLayerPoint([coord[1], coord[0]]);
            return `${i === 0 ? "M" : "L"}${point.x},${point.y}`;
          })
          .join(" ") + " Z"
      );
    })
    .join(" ");
};

export const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const leafletLayersRef = useRef<Record<string, L.LayerGroup>>({});
  const maskOverlayRef = useRef<HTMLDivElement | null>(null);

  const { layers, selectedFeature, setSelectedFeature } = useLayerStore();

  // Init mapa
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

  // Sincronização de camadas
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

    if (hasVisibleData && totalBounds.isValid()) {
      map.fitBounds(totalBounds, { padding: [40, 40], animate: true });
    }
  }, [layers, setSelectedFeature]);

  // Spotlight mask + isolamento de layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const removeMask = () => {
      if (maskOverlayRef.current) {
        maskOverlayRef.current.remove();
        maskOverlayRef.current = null;
      }
    };

    const applyMask = () => {
      removeMask();
      if (!selectedFeature) return;

      const { feature, layerId } = selectedFeature;
      const isPolygon = feature.geometry.type.includes("Polygon");

      // Isola layers: mostra só o layer do feature selecionado
      Object.entries(leafletLayersRef.current).forEach(([id, group]) => {
        if (id === layerId) {
          if (!map.hasLayer(group)) map.addLayer(group);
        } else {
          if (map.hasLayer(group)) map.removeLayer(group);
        }
      });

      // Spotlight apenas para polígonos
      if (!isPolygon) return;

      const pane = map.getPane("overlayPane");
      if (!pane) return;

      const size = map.getSize();
      const W = size.x;
      const H = size.y;

      // Monta SVG com fill-rule evenodd: retângulo - buraco do polígono
      const coords =
        feature.geometry.type === "Polygon"
          ? feature.geometry.coordinates
          : feature.geometry.coordinates[0]; // MultiPolygon: pega o primeiro anel

      const polyPath = polygonToSvgPath(map, coords);
      const rectPath = `M0,0 L${W},0 L${W},${H} L0,${H} Z`;

      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", `${W}`);
      svg.setAttribute("height", `${H}`);
      svg.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;";

      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", `${rectPath} ${polyPath}`);
      path.setAttribute("fill", "rgba(0,0,0,0.72)");
      path.setAttribute("fill-rule", "evenodd");

      svg.appendChild(path);

      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:400;";
      overlay.appendChild(svg);

      mapContainerRef.current?.appendChild(overlay);
      maskOverlayRef.current = overlay;

      // Redesenha o mask quando o mapa é movido/zoomado
      const redraw = () => {
        if (!maskOverlayRef.current || !map) return;
        const newSize = map.getSize();
        const nW = newSize.x;
        const nH = newSize.y;
        const newPolyPath = polygonToSvgPath(map, coords);
        const newRectPath = `M0,0 L${nW},0 L${nW},${nH} L0,${nH} Z`;
        svg.setAttribute("width", `${nW}`);
        svg.setAttribute("height", `${nH}`);
        path.setAttribute("d", `${newRectPath} ${newPolyPath}`);
      };

      map.on("move zoom moveend zoomend", redraw);

      // Cleanup dos listeners ao remover
      const originalRemove = overlay.remove.bind(overlay);
      overlay.remove = () => {
        map.off("move zoom moveend zoomend", redraw);
        originalRemove();
      };
    };

    applyMask();

    // Restaura todos os layers quando seleção é limpa
    if (!selectedFeature) {
      removeMask();
      layers.forEach((layer) => {
        const group = leafletLayersRef.current[layer.id];
        if (group && layer.visible && !map.hasLayer(group)) {
          map.addLayer(group);
        }
      });
      return;
    }

    // Navega para o feature
    const { feature } = selectedFeature;
    const geometry = feature.geometry;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeature]);

  return (
    <div ref={mapContainerRef} className="absolute inset-0 bg-slate-950" />
  );
};
