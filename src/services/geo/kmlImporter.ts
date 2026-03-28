import * as toGeoJSON from '@tmcw/togeojson'
import type { FeatureType, TJFeature, TJLayer } from '../../types/TJLayer'

/**
 * O @tmcw/togeojson pode retornar `description` como string HTML, objeto ou null.
 * Normaliza para string limpa (sem tags HTML).
 */
const extractDescription = (raw: unknown): string => {
  if (!raw) return ''
  if (typeof raw === 'string') return raw.replace(/<[^>]*>/g, '').trim()
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (typeof obj.value === 'string') return obj.value.replace(/<[^>]*>/g, '').trim()
    if (typeof obj.text === 'string') return obj.text.trim()
  }
  return ''
}

/**
 * Parse único de KML → TJLayer.
 * Chamado uma única vez no import. O KML original é descartado após isso.
 */
export const parseKmlToTJLayer = (kmlText: string, fileName: string): TJLayer => {
  const parser = new DOMParser()
  const kmlDom = parser.parseFromString(kmlText, 'text/xml')

  const internalName =
    kmlDom.querySelector('Document > name, Folder > name')?.textContent?.trim()

  const geoJson = toGeoJSON.kml(kmlDom)

  const features: TJFeature[] = geoJson.features
    .filter((f): f is typeof f & { geometry: NonNullable<typeof f.geometry> } => f.geometry !== null)
    .map((f) => {
      const geomType = f.geometry.type as FeatureType
      const rawName = (f.properties?.name as string) || 'Sem Nome'
      return {
        id: crypto.randomUUID(),
        name: rawName,
        number: '',   // preenchido manualmente pelo usuário no editor
        notes: extractDescription(f.properties?.description),
        type: geomType,
        geometry: {
          type: geomType,
          coordinates: (f.geometry as any).coordinates,
        },
      }
    })

  return {
    version: 1,
    id: crypto.randomUUID(),
    name: internalName || fileName.replace(/\.kml$/i, ''),
    visible: true,
    timestamp: Date.now(),
    features,
  }
}