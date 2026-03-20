import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Map as MapIcon,
  Layers,
  Settings,
} from "lucide-react";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    /* Posicionamento absoluto para flutuar sobre o mapa */
    <div className="absolute top-0 left-0 h-full z-[1001] flex flex-row pointer-events-none">
      <aside
        className={`
          ${isOpen ? "w-64" : "w-0"} 
          transition-all duration-300 ease-in-out
          bg-slate-900/95 text-slate-100 flex flex-col overflow-hidden 
          shadow-2xl pointer-events-auto
        `}
      >
        {/* Header Minimalista */}
        <div className="p-4 border-b border-slate-800/50 flex items-center gap-3 min-w-[256px]">
          <MapIcon className="text-blue-400" size={16} />
          <span className="text-sm font-semibold tracking-tight text-white uppercase italic">
            jwmaps
          </span>
        </div>

        {/* Menu Items Menores */}
        <nav className="flex-1 p-3 space-y-1 min-w-[256px]">
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white group">
            <Layers size={14} className="group-hover:text-blue-400" />
            <span className="text-xs font-medium">Camadas</span>
          </button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white group">
            <Settings size={14} className="group-hover:text-blue-400" />
            <span className="text-xs font-medium">Configurações</span>
          </button>
        </nav>

        {/* Footer Discreto */}
        <div className="p-4 border-t border-slate-800/50 text-[9px] text-slate-600 font-mono min-w-[256px]">
          BUILD 0.1.0-A
        </div>
      </aside>

      {/* Botão de Toggle */}
      <div className="pt-4 ml-[-1px] pointer-events-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            w-6 h-10 bg-slate-900 border border-slate-800 
            rounded-r-xl flex items-center justify-center
            text-slate-400 cursor-pointer shadow-lg
            hover:bg-slate-800 hover:text-white transition-all
          "
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
};
