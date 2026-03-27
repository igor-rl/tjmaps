import L from "leaflet";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const MapProviders = {
  // Camada 2D Gratuita (OpenStreetMap)
  getNormalLayer(): L.TileLayer {
    return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
      maxZoom: 19,
      crossOrigin: "anonymous", // Adicionado para permitir o print
    });
  },

  // Camada Core com Rótulos (Mapbox Satellite)
  getSatelliteLayer(): L.TileLayer {
    if (!MAPBOX_TOKEN) {
      console.warn("Mapbox Token não encontrado. Usando fallback OSM.");
      return this.getNormalLayer();
    }

    return L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      {
        attribution:
          '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 22,
        crossOrigin: "anonymous", // <--- CRUCIAL: Permite que o html2canvas capture os tiles
      },
    );
  },
};
