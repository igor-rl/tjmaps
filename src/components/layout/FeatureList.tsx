import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Hexagon,
  MapPin,
  GripVertical,
  Pencil,
  Trash2,
  Target,
} from "lucide-react";
import { useLayerStore } from "../../store/useLayerStore";

export const FeatureList = () => {
  const { layers, selectedFeature, setSelectedFeature } = useLayerStore();
  const parentRef = useRef<HTMLDivElement>(null);
  const [snapshot, setSnapshot] = useState<any[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const flat = layers.flatMap((layer) =>
      layer.data.features.map((feat: any, idx: number) => ({
        id: feat.id || `${layer.id}-${idx}`,
        name: feat.properties?.name || "Sem Nome",
        isPolygon: feat.geometry.type.includes("Polygon"),
        layerId: layer.id,
        feature: feat,
      })),
    );
    setSnapshot(
      flat.sort((a, b) =>
        a.isPolygon === b.isPolygon ? 0 : a.isPolygon ? -1 : 1,
      ),
    );
  }, [layers]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: snapshot.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20,
    overscan: 10,
  });

  const handleSelect = (item: any) => {
    setSelectedFeature({ layerId: item.layerId, feature: item.feature });
  };

  const saveEdit = (id: string) => {
    setSnapshot((prev) =>
      prev.map((it) => (it.id === id ? { ...it, name: editValue } : it)),
    );
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
      <div className="px-3 py-2 shrink-0 border-b border-white/5 bg-white/2">
        <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">
          Elementos
        </span>
      </div>

      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-1"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = snapshot[virtualRow.index];
            const isSelected = selectedFeature?.feature.id === item.id;
            const isEditing = editingId === item.id;

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`group flex items-center gap-1.5 px-2 hover:bg-white/4 transition-colors border-b border-white/2 ${isSelected ? "bg-blue-500/15" : ""}`}
              >
                {/* 1. GRIP (Arrastar) */}
                <div
                  draggable
                  onDragStart={() => setDraggedId(item.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    const dIdx = snapshot.findIndex((s) => s.id === draggedId);
                    if (dIdx !== -1 && dIdx !== virtualRow.index) {
                      const next = [...snapshot];
                      const [removed] = next.splice(dIdx, 1);
                      next.splice(virtualRow.index, 0, removed);
                      setSnapshot(next);
                    }
                  }}
                  onDragEnd={() => setDraggedId(null)}
                  className="w-3 shrink-0 flex items-center justify-center text-slate-800 cursor-grab active:cursor-grabbing hover:text-slate-600"
                >
                  <GripVertical size={8} />
                </div>

                {/* 2. ÍCONE */}
                <div className="shrink-0 opacity-40">
                  {item.isPolygon ? (
                    <Hexagon size={6} className="text-blue-500" />
                  ) : (
                    <MapPin size={6} className="text-orange-500" />
                  )}
                </div>

                {/* 3. NOME / INPUT (Editar) */}
                <div className="flex-1 min-w-0 h-full flex items-center">
                  {isEditing ? (
                    <input
                      autoFocus
                      className="w-full bg-blue-900/30 border-none text-[7px] text-white p-0 h-3.5 px-1 focus:ring-0 rounded"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(item.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                    />
                  ) : (
                    <span
                      onClick={() => handleSelect(item)}
                      className={`text-[7px] truncate flex-1 tracking-tight cursor-pointer py-1 ${isSelected ? "text-white font-bold" : "text-slate-500 hover:text-slate-200"}`}
                    >
                      {item.name}
                    </span>
                  )}
                </div>

                {/* 4. BOTÕES DE AÇÃO (Extremidade Direita) */}
                {!isEditing && (
                  <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 bg-slate-950/90 pl-1">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item.name);
                      }}
                      className="text-slate-700 hover:text-blue-400 p-0.5"
                    >
                      <Pencil size={8} />
                    </button>
                    <button
                      onClick={() => handleSelect(item)}
                      className="text-slate-700 hover:text-green-500 p-0.5"
                    >
                      <Target size={8} />
                    </button>
                    <button
                      onClick={() =>
                        setSnapshot((s) => s.filter((x) => x.id !== item.id))
                      }
                      className="text-slate-700 hover:text-red-500 p-0.5"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
