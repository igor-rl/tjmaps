import { useLayerStore } from "../../store/useLayerStore";
import { X, Save, Trash2, Hash } from "lucide-react";
import { useState, useEffect } from "react";

export const PropertyInspector = () => {
  const { selectedFeature, setSelectedFeature, updateFeature, deleteFeature } =
    useLayerStore();
  const [name, setName] = useState("");

  useEffect(() => {
    if (selectedFeature) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(selectedFeature.feature.properties?.name || "");
    }
  }, [selectedFeature]);

  if (!selectedFeature) return null;

  const featureId =
    selectedFeature.feature.id || selectedFeature.feature.properties?.id;

  const handleSave = () => {
    updateFeature(selectedFeature.layerId, featureId, { name });
    setSelectedFeature(null);
  };

  const handleDelete = () => {
    if (confirm("Excluir elemento permanentemente?")) {
      deleteFeature(selectedFeature.layerId, featureId);
    }
  };

  return (
    <div className="mt-2 pt-2 border-t border-white/5 w-full overflow-hidden animate-in fade-in duration-150">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-1">
          <Hash size={8} className="text-blue-500" />
          <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 text-nowrap">
            Inspector
          </span>
        </div>
        <button
          onClick={() => setSelectedFeature(null)}
          className="text-slate-700 hover:text-white transition-colors"
        >
          <X size={10} />
        </button>
      </div>

      <div className="bg-white/[0.02] p-1.5 rounded-md border border-white/5 space-y-2">
        <div className="w-full">
          <label className="text-[7px] font-bold text-slate-600 uppercase block mb-0.5 px-0.5">
            Identificação
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded px-1.5 py-1 text-[9px] text-slate-300 focus:outline-none focus:border-blue-600/30 transition-all font-medium"
            placeholder="Nome..."
          />
        </div>

        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600/80 hover:bg-blue-600 text-white text-[8px] font-bold py-1 rounded flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <Save size={8} /> SALVAR
          </button>
          <button
            onClick={handleDelete}
            className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-500/70 rounded transition-colors active:scale-95"
          >
            <Trash2 size={9} />
          </button>
        </div>
      </div>

      <div className="mt-1.5 px-1 flex justify-between text-[6px] text-slate-700 font-mono uppercase tracking-widest opacity-60">
        <span>{selectedFeature.feature.geometry.type}</span>
        <span>ID: {String(featureId || "N/A").slice(0, 6)}</span>
      </div>
    </div>
  );
};
