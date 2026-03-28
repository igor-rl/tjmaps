import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import { MapProviders } from '../../services/map/mapProvider'
import { useLayerStore } from '../../store/useLayerStore'
import { toGeoJSON } from '../../types/TJLayer'
import type { TJFeature } from '../../types/TJLayer'

import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const getGroupBounds = (group: L.LayerGroup): L.LatLngBounds => {
  if ('getBounds' in group && typeof (group as any).getBounds === 'function') {
    return (group as any).getBounds()
  }
  return L.latLngBounds([])
}

export const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const leafletLayersRef = useRef<Record<string, L.LayerGroup>>({})
  const maskOverlayRef = useRef<L.Polygon | null>(null)

  const { layers, selectedFeature, setSelectedFeature, isPrinting } =
    useLayerStore()

  // 1. Inicialização do Mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: false,
      renderer: L.canvas({ padding: 0.1 }),
      fadeAnimation: true,
    })

    MapProviders.getSatelliteLayer().addTo(map)
    mapInstanceRef.current = map

    setTimeout(() => {
      if (mapInstanceRef.current) map.invalidateSize()
    }, 100)

    return () => {
      // Limpa layers antes de remover o mapa para evitar race condition no canvas
      Object.values(leafletLayersRef.current).forEach((layer) => {
        try { map.removeLayer(layer) } catch (_) {}
      })
      leafletLayersRef.current = {}
      map.remove()
      mapInstanceRef.current = null
    }
  }, [setSelectedFeature])

  // 2. Sincronização de Camadas
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.getContainer()) return

    const totalBounds = L.latLngBounds([])
    let hasVisibleData = false

    // Remove layers que não existem mais
    Object.keys(leafletLayersRef.current).forEach((id) => {
      if (!layers.find((l) => l.id === id)) {
        map.removeLayer(leafletLayersRef.current[id])
        delete leafletLayersRef.current[id]
      }
    })

    layers.forEach((layer) => {
      // Remove a versão anterior para re-renderizar com dados atualizados
      if (leafletLayersRef.current[layer.id]) {
        map.removeLayer(leafletLayersRef.current[layer.id])
      }

      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 30,
        disableClusteringAtZoom: 18,
        spiderfyOnMaxZoom: true,
      })

      // Converte TJLayer → GeoJSON para o Leaflet
      const geoJsonData = L.geoJSON(toGeoJSON(layer) as any, {
        style: {
          color: '#3b82f6',
          weight: 2,
          fillOpacity: 0,
          opacity: 1,
        },
        onEachFeature: (geoFeature, leafletLayer) => {
          leafletLayer.on('click', (e) => {
            L.DomEvent.stopPropagation(e)
            // Busca a TJFeature original pelo id para passar ao store
            const tjFeature = layer.features.find(
              (f) => f.id === geoFeature.id,
            )
            if (tjFeature) {
              setSelectedFeature({ layerId: layer.id, feature: tjFeature })
            }
          })

          if (geoFeature.properties?.name) {
            leafletLayer.bindTooltip(geoFeature.properties.name, {
              sticky: true,
              direction: 'top',
              className: 'custom-tooltip',
            })
          }
        },
      })

      geoJsonData.eachLayer((l) => clusterGroup.addLayer(l))
      leafletLayersRef.current[layer.id] = clusterGroup

      if (layer.visible) {
        map.addLayer(clusterGroup)
        const layerBounds = getGroupBounds(clusterGroup)
        if (layerBounds.isValid()) {
          totalBounds.extend(layerBounds)
          hasVisibleData = true
        }
      }
    })

    if (hasVisibleData && totalBounds.isValid() && !selectedFeature) {
      map.fitBounds(totalBounds, { padding: [40, 40], animate: true })
    }
  }, [layers, selectedFeature, setSelectedFeature])

  // 3. Spotlight Mask + Navegação
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const removeMask = () => {
      if (maskOverlayRef.current) {
        map.removeLayer(maskOverlayRef.current)
        maskOverlayRef.current = null
      }
    }

    if (!selectedFeature) {
      removeMask()
      return
    }

    const feature: TJFeature = selectedFeature.feature
    const isPolygon = feature.type === 'Polygon' || feature.type === 'MultiPolygon'

    if (isPolygon) {
      removeMask()

      const worldOuter = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
      ]

      const featureCoords =
        feature.geometry.type === 'Polygon'
          ? feature.geometry.coordinates
          : feature.geometry.coordinates[0]

      const holeCoords = featureCoords.map((ring: number[][]) =>
        ring.map((coord: number[]) => [coord[1], coord[0]]),
      )

      const mask = L.polygon([worldOuter as any, ...holeCoords], {
        color: 'transparent',
        fillColor: 'black',
        fillOpacity: 0.4,
        interactive: false,
        className: 'spotlight-mask',
      }).addTo(map)

      maskOverlayRef.current = mask
    }

    // Navega apenas quando não está no modo impressão
    if (!isPrinting) {
      if (feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates
        map.flyTo([lat, lng], 18, { animate: true, duration: 1.2 })
      } else {
        const tempLayer = L.geoJSON({
          type: 'Feature',
          id: feature.id,
          properties: {},
          geometry: feature.geometry,
        } as any)
        const bounds = tempLayer.getBounds()
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [60, 60],
            maxZoom: 17,
            animate: true,
            duration: 1.2,
          })
        }
      }
    }

    return () => removeMask()
  }, [selectedFeature, isPrinting])

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 bg-slate-950 z-0"
      style={{ cursor: 'grab' }}
    />
  )
}