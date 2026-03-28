import { useEffect, useRef, useState, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Hexagon, MapPin, GripVertical } from 'lucide-react'
import { useLayerStore } from '../../store/useLayerStore'
import type { TJFeature } from '../../types/TJLayer'

interface FlatItem {
  feature: TJFeature
  layerId: string
  isPolygon: boolean
}

export const FeatureList = () => {
  const { layers, selectedFeature, setSelectedFeature, reorderFeatures } =
    useLayerStore()
  const parentRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<FlatItem[]>([])
  const dragIndexRef = useRef<number | null>(null)

  // Reconstrói a lista toda vez que as layers mudarem
  useEffect(() => {
    const flat: FlatItem[] = layers.flatMap((layer) =>
      layer.features.map((feature) => ({
        feature,
        layerId: layer.id,
        isPolygon: feature.type === 'Polygon' || feature.type === 'MultiPolygon',
      })),
    )
    // Polígonos primeiro, depois pontos
    flat.sort((a, b) =>
      a.isPolygon === b.isPolygon ? 0 : a.isPolygon ? -1 : 1,
    )
    setItems(flat)
  }, [layers])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 10,
  })

  const handleSelect = useCallback(
    (item: FlatItem) => {
      setSelectedFeature({ layerId: item.layerId, feature: item.feature })
    },
    [setSelectedFeature],
  )

  // ── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index
  }

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault()
    const dragIndex = dragIndexRef.current
    if (dragIndex === null || dragIndex === overIndex) return

    setItems((prev) => {
      const next = [...prev]
      const [removed] = next.splice(dragIndex, 1)
      next.splice(overIndex, 0, removed)
      dragIndexRef.current = overIndex
      return next
    })
  }

  const handleDragEnd = async () => {
    dragIndexRef.current = null

    // Persiste a nova ordem por layer
    // Agrupa os items por layerId mantendo a ordem atual
    const byLayer: Record<string, TJFeature[]> = {}
    for (const item of items) {
      if (!byLayer[item.layerId]) byLayer[item.layerId] = []
      byLayer[item.layerId].push(item.feature)
    }

    for (const [layerId, features] of Object.entries(byLayer)) {
      await reorderFeatures(layerId, features)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
      {/* Header */}
      <div className="px-3 py-2.5 shrink-0 border-b border-white/5">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Elementos ({items.length})
        </span>
      </div>

      {items.length === 0 && (
        <p className="px-3 py-4 text-[11px] text-slate-700 italic">
          Nenhum elemento. Importe um KML para começar.
        </p>
      )}

      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-1"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index]
            if (!item) return null

            const isSelected =
              selectedFeature?.feature.id === item.feature.id

            return (
              <div
                key={item.feature.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`group flex items-center gap-2 px-2 hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] ${
                  isSelected ? 'bg-blue-500/15' : ''
                }`}
                draggable
                onDragStart={() => handleDragStart(virtualRow.index)}
                onDragOver={(e) => handleDragOver(e, virtualRow.index)}
                onDragEnd={handleDragEnd}
              >
                {/* Grip */}
                <div className="w-3.5 shrink-0 flex items-center justify-center text-slate-800 cursor-grab active:cursor-grabbing hover:text-slate-600">
                  <GripVertical size={13} />
                </div>

                {/* Ícone */}
                <div className="shrink-0 opacity-50">
                  {item.isPolygon ? (
                    <Hexagon size={12} className="text-blue-500" />
                  ) : (
                    <MapPin size={12} className="text-orange-500" />
                  )}
                </div>

                {/* Nome */}
                <span
                  onClick={() => handleSelect(item)}
                  className={`text-[12px] truncate flex-1 tracking-tight cursor-pointer ${
                    isSelected
                      ? 'text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.feature.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}