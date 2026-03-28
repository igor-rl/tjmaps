import { useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { MapView } from "./components/map/MapView";
import { KmlService } from "./services/geo/kmlService";
import { useLayerStore } from "./store/useLayerStore";

// Detecta se está rodando no Electron em produção
const getBasePath = () => {
  if (window.location.protocol === "file:") {
    // Pega o diretório do index.html e monta o path absoluto
    const base = window.location.href.replace(/\/[^/]*$/, "");
    return `${base}/data/kml`;
  }
  return "/data/kml";
};

function App() {
  const addLayer = useLayerStore((state) => state.addLayer);
  const isPrinting = useLayerStore((state) => state.isPrinting);

  useEffect(() => {
    const bootApp = async () => {
      try {
        const basePath = getBasePath();
        const response = await fetch(`${basePath}/layers.json`);
        if (!response.ok)
          throw new Error("Manifesto layers.json não encontrado.");

        const files: string[] = await response.json();

        for (const fileName of files) {
          const data = await KmlService.loadInternalKml(`${basePath}/${fileName}`);
          addLayer(data);
        }
      } catch (err) {
        console.error("Erro no boot dinâmico:", err);
      }
    };

    bootApp();
  }, [addLayer]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex">
      <div className="flex-1 relative h-full overflow-hidden">
        <MapView />
      </div>
      <div className={isPrinting ? "hidden" : "contents"}>
        <Sidebar />
      </div>
    </main>
  );
}

export default App;