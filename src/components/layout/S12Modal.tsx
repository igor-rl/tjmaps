import { X, Camera } from "lucide-react";
import { useLayerStore } from "../../store/useLayerStore";
import html2canvas from "html2canvas";

export const S12Modal = ({ onClose }: { onClose: () => void }) => {
  const { selectedFeature, layers } = useLayerStore();

  if (!selectedFeature) return null;

  const currentLayer = layers.find((l) => l.id === selectedFeature.layerId);
  const locality = currentLayer?.name || "Localidade";
  const featureName = selectedFeature.feature.properties?.name || "S/N";

  const handleCapture = async () => {
    const screenshotTarget = document.getElementById("map-capture-area");
    if (!screenshotTarget) return;

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
      });

      const cropCanvas = document.createElement("canvas");
      const ctx = cropCanvas.getContext("2d");
      const rect = screenshotTarget.getBoundingClientRect();

      cropCanvas.width = rect.width * 2;
      cropCanvas.height = rect.height * 2;

      if (ctx) {
        ctx.drawImage(
          canvas,
          rect.left * 2,
          rect.top * 2,
          rect.width * 2,
          rect.height * 2,
          0,
          0,
          rect.width * 2,
          rect.height * 2,
        );
      }

      const imageData = cropCanvas.toDataURL("image/jpeg", 0.95);
      console.log("📸 Captura pronta!");
      alert("Enquadramento capturado!");
    } catch (error) {
      console.error("Erro na captura:", error);
    }
  };

  return (
    // pointer-events-none permite mover o mapa por baixo do preto
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none no-print overflow-hidden bg-transparent">
      {/* BOTÕES */}
      <div className="absolute top-8 right-8 flex gap-4 z-[10001] pointer-events-auto">
        <button
          onClick={handleCapture}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl transition-all active:scale-95 border border-emerald-400/20"
        >
          <Camera size={20} />
          Gerar Cartão S-12
        </button>
        <button
          onClick={onClose}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-full text-white transition-all shadow-xl border border-white/10"
        >
          <X size={24} />
        </button>
      </div>

      {/* ÁREA CENTRALIZADA DO VISOR */}
      <div className="relative flex flex-col items-center pointer-events-none w-[90vw] max-w-[1200px]">
        {/* RETÂNGULO + SOMBRA (O FURO) */}
        <div
          id="map-capture-area"
          style={{
            width: "100%",
            aspectRatio: "14 / 5.8",
          }}
          // shadow-[0_0_0_100vmax] cria o fundo preto fundido com a linha amarela
          className="border-[1.5px] border-yellow-400 relative shadow-[0_0_0_100vmax_rgba(0,0,0,0.7)]"
        >
          <div className="absolute -top-6 left-0 text-yellow-400 text-[10px] font-black uppercase tracking-widest bg-black/60 px-2 py-0.5">
            Área de Impressão (14x5.8cm)
          </div>
        </div>

        {/* Textos Informativos fora do recorte */}
        <div className="mt-10 text-center text-white drop-shadow-2xl">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            {locality}
          </h2>
          <div className="h-[2px] w-40 bg-yellow-400/50 mx-auto my-3" />
          <p className="text-sm font-bold opacity-80 uppercase tracking-[0.3em]">
            Território Nº {featureName}
          </p>
        </div>
      </div>
    </div>
  );
};
