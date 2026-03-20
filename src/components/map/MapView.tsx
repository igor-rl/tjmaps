import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapProviders } from "../../services/map/mapProvider";

export const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Inicializa o mapa focado em Correntina - BA (Aprox)
    const map = L.map(mapContainerRef.current, {
      center: [-13.3433, -44.6367],
      zoom: 13,
      zoomControl: false, // Desativado para customização futura na UI
    });

    // Adiciona a camada Core (Mapbox) por padrão
    MapProviders.getSatelliteLayer().addTo(map);

    // Controle de escala (importante para GIS)
    L.control.scale({ imperial: false, position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="flex-1 h-full w-full bg-slate-200"
      id="map-container"
    />
  );
};
