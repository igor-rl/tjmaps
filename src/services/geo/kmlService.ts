import * as toGeoJSON from "@tmcw/togeojson";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

export interface ProcessedKml {
  id: string;
  name: string;
  fileName: string;
  data: FeatureCollection<Geometry, GeoJsonProperties>;
  timestamp: number;
  visible: boolean;
}

export const KmlService = {
  /**
   * Processa um arquivo vindo de um input (upload do usuário)
   */
  async processFile(file: File): Promise<ProcessedKml> {
    const content = await file.text();
    return this.parseKmlContent(content, file.name);
  },

  /**
   * Carrega um arquivo KML interno da pasta /public
   */
  async loadInternalKml(url: string): Promise<ProcessedKml> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Falha ao carregar o recurso: ${url}`);

    const content = await response.text();
    const fileName = url.split("/").pop() || "camada_interna.kml";
    return this.parseKmlContent(content, fileName);
  },

  /**
   * Lógica central de parsing (Agnóstica)
   */
  parseKmlContent(content: string, fallbackName: string): ProcessedKml {
    const parser = new DOMParser();
    const kmlDom = parser.parseFromString(content, "text/xml");

    // Tenta extrair o nome de dentro do KML (<name>) ou usa o nome do arquivo
    const internalName = kmlDom.querySelector(
      "Document > name, Folder > name",
    )?.textContent;

    const geoJsonData = toGeoJSON.kml(kmlDom) as FeatureCollection<
      Geometry,
      GeoJsonProperties
    >;

    return {
      id: crypto.randomUUID(),
      name: internalName || fallbackName.replace(".kml", ""),
      fileName: fallbackName,
      data: geoJsonData,
      timestamp: Date.now(),
      visible: true,
    };
  },
};
