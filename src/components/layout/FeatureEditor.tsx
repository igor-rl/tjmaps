import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, FileText, Hexagon, MapPin } from "lucide-react";
import { useLayerStore } from "../../store/useLayerStore";
import { S12Modal } from "./S12Modal";

export const FeatureEditor = () => {
  const {
    selectedFeature,
    setSelectedFeature,
    updateFeature,
    deleteFeature,
    setPrinting,
  } = useLayerStore();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [showS12, setShowS12] = useState(false);

  const feature = selectedFeature?.feature;
  const layerId = selectedFeature?.layerId;
  const isPolygon = feature?.geometry?.type?.includes("Polygon");

  // Atualiza os campos internos quando a feature selecionada muda
  useEffect(() => {
    if (feature) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(feature.properties?.name || "");
      setNotes(feature.properties?.notes || "");
    }
  }, [feature]);

  if (!selectedFeature || !feature) return null;

  const handleOpenS12 = () => {
    setPrinting(true); // Esconde a Sidebar no App.tsx
    setShowS12(true); // Abre a Modal
  };

  const handleCloseS12 = () => {
    setPrinting(false); // Volta a Sidebar no App.tsx
    setShowS12(false); // Fecha a Modal
  };

  const handleOk = () => {
    if (layerId && (feature.id || feature.properties?.id)) {
      updateFeature(layerId, feature.id || feature.properties?.id, {
        name,
        notes,
      });
    }
    setSelectedFeature(null);
  };

  const handleDelete = () => {
    if (layerId && (feature.id || feature.properties?.id)) {
      deleteFeature(layerId, feature.id || feature.properties?.id);
    }
    setSelectedFeature(null);
  };

  return (
    <div className="shrink-0 border-b border-white/5 bg-white/[0.02]">
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          {isPolygon ? (
            <Hexagon size={12} className="text-blue-400" />
          ) : (
            <MapPin size={12} className="text-orange-400" />
          )}
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Edição
          </span>
        </div>
        <button
          onClick={() => setSelectedFeature(null)}
          className="p-0.5 text-slate-600 hover:text-slate-300"
        >
          <X size={12} />
        </button>
      </div>

      <div className="px-3 py-2.5 flex flex-col gap-2.5">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            Nome
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[12px] text-slate-200 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[12px] text-slate-200 resize-none custom-scrollbar"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {isPolygon && (
            <button
              onClick={handleOpenS12}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors text-[11px] font-semibold"
            >
              <FileText size={12} />
              S-12
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleDelete}
            className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleOk}
            className="px-3 py-1.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-bold hover:bg-blue-500/30"
          >
            OK
          </button>
        </div>
      </div>

      {/* RENDERIZAÇÃO VIA PORTAL */}
      {showS12 &&
        createPortal(<S12Modal onClose={handleCloseS12} />, document.body)}
    </div>
  );
};
