import { useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { MapView } from "./components/map/MapView";
import { KmlService } from "./services/geo/kmlService";
import { useLayerStore } from "./store/useLayerStore";

function App() {
  const addLayer = useLayerStore((state) => state.addLayer);

  useEffect(() => {
    const bootApp = async () => {
      try {
        // 1. Busca a lista de arquivos
        const response = await fetch("/data/layers.json");
        if (!response.ok)
          throw new Error("Manifesto layers.json não encontrado.");

        const files: string[] = await response.json();

        // 2. Carrega cada arquivo KML da lista
        for (const fileName of files) {
          const data = await KmlService.loadInternalKml(`/data/${fileName}`);
          addLayer(data);
        }
      } catch (err) {
        console.error("Erro no boot dinâmico:", err);
      }
    };

    bootApp();
  }, [addLayer]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />
      <MapView />
    </main>
  );
}

export default App;
