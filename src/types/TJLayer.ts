/**
 * Formato interno TJMaps.
 * Gerado a partir de um KML importado e salvo como .tjlayer (JSON) no disco.
 * O KML original é descartado após o parse.
 */

export type FeatureType = 'Polygon' | 'MultiPolygon' | 'Point'

export interface TJFeature {
  id: string              // UUID estável, gerado uma vez no import
  name: string            // Nome/label do território
  number: string          // Número do território (ex: "25")
  notes: string           // Observações livres
  type: FeatureType
  geometry: {
    type: FeatureType
    coordinates: any
  }
}

export interface TJLayer {
  version: 1
  id: string
  name: string
  visible: boolean
  timestamp: number
  features: TJFeature[]
}

// Converte TJLayer para GeoJSON FeatureCollection (usado pelo Leaflet)
export const toGeoJSON = (layer: TJLayer) => ({
  type: 'FeatureCollection' as const,
  features: layer.features.map((f) => ({
    type: 'Feature' as const,
    id: f.id,
    properties: { name: f.name, notes: f.notes, number: f.number },
    geometry: f.geometry,
  })),
})