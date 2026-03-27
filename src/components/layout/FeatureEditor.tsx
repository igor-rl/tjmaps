import { useState, useEffect } from "react";
import { X, Trash2, FileText, Check, Hexagon, MapPin } from "lucide-react";
import { useLayerStore } from "../../store/useLayerStore";

export const FeatureEditor = () => {
  const { selectedFeature, setSelectedFeature, updateFeature, deleteFeature } =
    useLayerStore();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const feature = selectedFeature?.feature;
  const layerId = selectedFeature?.layerId;
  const isPolygon = feature?.geometry?.type?.includes("Polygon");

  useEffect(() => {
    if (feature) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(feature.properties?.name || "");
      setNotes(feature.properties?.notes || "");
    }
  }, [feature]);

  if (!selectedFeature || !feature) return null;

  const handleOk = () => {
    if (layerId && feature.id) {
      updateFeature(layerId, feature.id, { name, notes });
    }
    setSelectedFeature(null);
  };

  const handleDelete = () => {
    if (layerId && feature.id) {
      deleteFeature(layerId, feature.id);
    }
    setSelectedFeature(null);
  };

  return (
    <div className="shrink-0 border-b border-white/5 bg-white/[0.02]">
      {/* Header da guia */}
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
          className="p-0.5 text-slate-600 hover:text-slate-300 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Campos */}
      <div className="px-3 py-2.5 flex flex-col gap-2.5">
        {/* Nome */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            Nome
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOk()}
            className="w-full bg-white/5 border border-white/8 rounded px-2 py-1.5 text-[12px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            placeholder="Nome do elemento"
          />
        </div>

        {/* Observações */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/8 rounded px-2 py-1.5 text-[12px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none custom-scrollbar"
            placeholder="Anotações sobre este elemento..."
          />
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1.5">
          {/* PDF — apenas polígono, desabilitado por ora */}
          {isPolygon && (
            <button
              disabled
              title="Em breve"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 border border-white/8 text-slate-600 cursor-not-allowed text-[11px] font-semibold"
            >
              <FileText size={12} />
              PDF
            </button>
          )}

          <div className="flex-1" />

          {/* Excluir */}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-[11px] font-semibold"
          >
            <Trash2 size={12} />
            Excluir
          </button>

          {/* OK */}
          <button
            onClick={handleOk}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors text-[11px] font-semibold"
          >
            <Check size={12} />
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
