import { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  Layers,
  Settings,
  FileUp,
  Loader2,
  Eye,
  Trash2,
} from "lucide-react";
import { KmlService } from "../../services/geo/kmlService";
import { useLayerStore } from "../../store/useLayerStore";
import { PropertyInspector } from "../inspector/PropertyInspector";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { layers, addLayer, toggleVisibility, removeLayer, selectedFeature } =
    useLayerStore();

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const processed = await KmlService.processFile(file);
      addLayer(processed);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute top-0 left-0 h-full z-[1001] flex flex-row pointer-events-none font-sans">
      <aside
        className={` ${isOpen ? "w-60" : "w-0"} transition-all duration-300 ease-in-out bg-slate-950/95 backdrop-blur-md text-slate-100 flex flex-col overflow-hidden shadow-2xl pointer-events-auto border-r border-white/5 `}
      >
        <div className="p-3 border-b border-white/5 flex items-center gap-2 min-w-[240px]">
          <div className="p-1 bg-blue-500/20 rounded-md">
            <MapIcon className="text-blue-400" size={12} />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase italic">
            jwmaps
          </span>
        </div>

        <nav className="flex-1 p-2 min-w-[240px] overflow-y-auto overflow-x-hidden custom-scrollbar">
          <button
            onClick={handleImportClick}
            disabled={isProcessing}
            className="flex items-center gap-2 w-full p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white mb-3 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 size={10} className="animate-spin text-blue-400" />
            ) : (
              <FileUp size={10} className="text-blue-400" />
            )}
            <span className="text-[9px] font-bold uppercase tracking-tight">
              {isProcessing ? "Lendo..." : "Importar"}
            </span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".kml"
            className="hidden"
          />

          <div className="px-1.5 pb-1 text-[8px] font-black text-slate-600 uppercase tracking-widest">
            Layers ({layers.length})
          </div>
          <div className="space-y-0.5">
            {layers.length === 0 ? (
              <div className="p-2 text-center border border-dashed border-white/5 rounded-md">
                <p className="text-[8px] text-slate-700 uppercase">Standby</p>
              </div>
            ) : (
              layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded border transition-all ${layer.visible ? "bg-white/5 border-white/5" : "bg-transparent border-transparent opacity-40"}`}
                >
                  <Layers
                    size={10}
                    className={
                      layer.visible ? "text-blue-500" : "text-slate-700"
                    }
                  />
                  <span className="text-[9px] truncate flex-1 font-semibold text-slate-300">
                    {layer.name}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => toggleVisibility(layer.id)}
                      className="p-1 text-slate-500 hover:text-white transition-colors"
                    >
                      <Eye size={10} />
                    </button>
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {selectedFeature && <PropertyInspector />}
        </nav>

        <div className="p-3 border-t border-white/5 text-[8px] text-slate-600 font-mono min-w-[240px] flex justify-between items-center">
          <span className="tracking-tighter opacity-30 italic text-[7px]">
            READY
          </span>
          <div className="flex gap-2 items-center">
            <span className="font-bold tracking-widest text-[7px]">
              v0.1.0-A
            </span>
            <Settings
              size={10}
              className="hover:text-white cursor-pointer transition-colors"
            />
          </div>
        </div>
      </aside>
      <div className="pt-3 ml-[-1px] pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-4 h-8 bg-slate-950/95 border border-white/10 rounded-r-md flex items-center justify-center text-slate-600 hover:text-white transition-all shadow-xl"
        >
          {isOpen ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
        </button>
      </div>
    </div>
  );
};
