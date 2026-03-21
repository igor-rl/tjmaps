import { useRef, useState } from "react";
import {
  Map as MapIcon,
  FileUp,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileJson,
} from "lucide-react";
import { useLayerStore } from "../../store/useLayerStore";
import { FeatureList } from "./FeatureList";
import { parseKML } from "../../utils/kmlParser";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { layers, addLayer, removeLayer, toggleVisibility } = useLayerStore();

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const kmlText = await file.text();
      const geojson = parseKML(kmlText);

      addLayer({
        id: crypto.randomUUID(),
        name: file.name.replace(".kml", ""),
        fileName: file.name,
        data: geojson as any,
        visible: true,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Erro ao processar KML:", error);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute top-0 left-0 h-full z-[1001] flex flex-row pointer-events-none font-sans">
      <aside
        className={`
        ${isOpen ? "w-64" : "w-0"} 
        transition-all duration-300 ease-in-out bg-slate-950/95 backdrop-blur-md 
        text-slate-100 flex flex-col overflow-hidden border-r border-white/5 pointer-events-auto
      `}
      >
        <div className="p-2 border-b border-white/5 flex items-center justify-between min-w-[250px]">
          <div className="flex items-center gap-1.5 select-none">
            <MapIcon size={10} className="text-blue-500" />
            <span className="text-[9px] font-black tracking-[0.2em] uppercase italic text-white">
              jwmaps
            </span>
          </div>

          <button
            onClick={handleImportClick}
            disabled={isProcessing}
            className="p-1.5 rounded-md bg-white/5 hover:bg-blue-500/20 border border-white/10 transition-all group shrink-0"
          >
            {isProcessing ? (
              <Loader2 size={10} className="animate-spin text-blue-400" />
            ) : (
              <FileUp
                size={10}
                className="text-slate-400 group-hover:text-blue-400"
              />
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".kml"
              className="hidden"
            />
          </button>
        </div>

        <div className="flex flex-col min-w-[250px]">
          <div
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest text-slate-500">
              Layers
            </span>
            {isLayersOpen ? (
              <ChevronDown size={8} className="text-slate-600" />
            ) : (
              <ChevronRight size={8} className="text-slate-600" />
            )}
          </div>

          {isLayersOpen && (
            <div className="px-1 pb-2 space-y-0.5 max-h-32 overflow-y-auto custom-scrollbar">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className="group flex items-center gap-2 px-2 py-0.5 transition-colors"
                >
                  <FileJson
                    size={8}
                    className={
                      layer.visible ? "text-blue-500/80" : "text-slate-800"
                    }
                  />
                  <span
                    className={`text-[8px] truncate flex-1 tracking-tight ${layer.visible ? "text-slate-400" : "text-slate-700"}`}
                  >
                    {layer.name}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0">
                    <button
                      onClick={() => toggleVisibility(layer.id)}
                      className="p-0.5 hover:text-blue-400"
                    >
                      {layer.visible ? <Eye size={9} /> : <EyeOff size={9} />}
                    </button>
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="p-0.5 text-slate-700 hover:text-red-500"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <FeatureList />
      </aside>

      <div className="flex items-center pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-950/95 p-1.5 rounded-r-md border-y border-r border-white/5 text-slate-500 hover:text-white transition-colors"
        >
          {isOpen ? (
            <ChevronRight size={10} className="rotate-180" />
          ) : (
            <ChevronRight size={10} />
          )}
        </button>
      </div>
    </div>
  );
};
