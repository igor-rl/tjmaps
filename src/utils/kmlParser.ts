/**
 * tjmaps - KML to GeoJSON Parser
 * Converte XML de KML para FeatureCollection GeoJSON compatível com Leaflet/Zustand.
 */

export const parseKML = (kmlText: string): any => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlText, "text/xml");
  const placemarks = xmlDoc.getElementsByTagName("Placemark");

  const features = Array.from(placemarks)
    .map((placemark, index) => {
      const name =
        placemark.getElementsByTagName("name")[0]?.textContent ||
        `Elemento ${index + 1}`;

      const polygon = placemark.getElementsByTagName("Polygon")[0];
      const point = placemark.getElementsByTagName("Point")[0];

      let geometry: any = null;

      if (polygon) {
        const coordsText =
          polygon.getElementsByTagName("coordinates")[0]?.textContent || "";
        const coords = parseCoords(coordsText);
        if (coords.length > 0) {
          geometry = {
            type: "Polygon" as const,
            coordinates: [coords],
          };
        }
      } else if (point) {
        const coordsText =
          point.getElementsByTagName("coordinates")[0]?.textContent || "";
        const coords = parseCoords(coordsText)[0];
        if (coords) {
          geometry = {
            type: "Point" as const,
            coordinates: coords,
          };
        }
      }

      return {
        type: "Feature" as const,
        id: crypto.randomUUID(),
        properties: { name },
        geometry,
      };
    })
    .filter((f) => f.geometry !== null);

  return {
    type: "FeatureCollection" as const,
    features,
  };
};

const parseCoords = (coordsString: string): number[][] => {
  return coordsString
    .trim()
    .split(/\s+/)
    .map((coord) => {
      const parts = coord.split(",");
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      return [lng, lat];
    })
    .filter((coord) => !isNaN(coord[0]) && !isNaN(coord[1]));
};
