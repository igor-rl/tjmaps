import { useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { MapView } from "./components/map/MapView";
import { KmlService } from "./services/geo/kmlService";
import { useLayerStore } from "./store/useLayerStore";

function App() {
  const addLayer = useLayerStore((state) => state.addLayer);
  const isPrinting = useLayerStore((state) => state.isPrinting);

  useEffect(() => {
    const bootApp = async () => {
      try {
        const response = await fetch("/data/kml/layers.json");
        if (!response.ok)
          throw new Error("Manifesto layers.json não encontrado.");

        const files: string[] = await response.json();

        for (const fileName of files) {
          const data = await KmlService.loadInternalKml(
            `/data/kml/${fileName}`,
          );
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
      {/* O MapView ocupa o fundo total */}
      <div className="flex-1 relative h-full overflow-hidden">
        <MapView />
      </div>

      {/* Mantemos a Sidebar viva no DOM, mas escondemos via CSS.
          Isso permite que o FeatureEditor continue processando a S12Modal via Portal.
      */}
      <div className={isPrinting ? "hidden" : "contents"}>
        <Sidebar />
      </div>
    </main>
  );
}

export default App;
