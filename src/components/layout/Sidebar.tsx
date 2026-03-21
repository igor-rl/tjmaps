import { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  Layers,
  Settings,
  FileUp,
  Loader2,
} from "lucide-react";
import { KmlService } from "../../services/geo/kmlService";
import { useLayerStore } from "../../store/useLayerStore";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks do Store
  const addLayer = useLayerStore((state) => state.addLayer);
  const layers = useLayerStore((state) => state.layers);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const processed = await KmlService.processFile(file);
      addLayer(processed);
      console.log("Sucesso:", processed.name);
    } catch (error) {
      console.error("Falha na importação:", error);
      alert("Erro ao processar KML. Verifique se o ficheiro é válido.");
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
          transition-all duration-300 ease-in-out
          bg-slate-950/90 backdrop-blur-md text-slate-100 
          flex flex-col overflow-hidden shadow-2xl pointer-events-auto
          border-r border-white/5
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3 min-w-[256px]">
          <div className="p-1.5 bg-blue-500/20 rounded-lg">
            <MapIcon className="text-blue-400" size={16} />
          </div>
          <span className="text-sm font-bold tracking-widest text-white uppercase italic">
            jwmaps
          </span>
        </div>

        {/* Menu Principal */}
        <nav className="flex-1 p-3 space-y-1 min-w-[256px] overflow-y-auto">
          <button
            onClick={handleImportClick}
            disabled={isProcessing}
            className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white group mb-6 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 size={14} className="animate-spin text-blue-400" />
            ) : (
              <FileUp size={14} className="text-blue-400" />
            )}
            <span className="text-xs font-semibold">
              {isProcessing ? "A processar..." : "Importar KML"}
            </span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".kml"
            className="hidden"
          />

          <div className="px-2 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            Camadas Ativas ({layers.length})
          </div>

          {layers.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-white/5 rounded-xl">
              <p className="text-[10px] text-slate-500">
                Nenhum dado importado
              </p>
            </div>
          ) : (
            layers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-white/5 text-slate-300 border border-transparent hover:border-white/10"
              >
                <Layers size={14} className="text-slate-500" />
                <span className="text-xs truncate flex-1">{layer.name}</span>
              </div>
            ))
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 text-[9px] text-slate-600 font-mono min-w-[256px] flex justify-between">
          <span>BUILD 0.1.0-A</span>
          <Settings size={12} className="hover:text-white cursor-pointer" />
        </div>
      </aside>

      {/* Botão de Toggle */}
      <div className="pt-4 ml-[-1px] pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            w-6 h-10 bg-slate-950/90 backdrop-blur-md border border-white/10
            rounded-r-xl flex items-center justify-center
            text-slate-400 cursor-pointer shadow-lg
            hover:text-white transition-all
          "
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
};
