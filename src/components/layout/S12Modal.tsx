import { useState } from "react"
import { X, FileText, Loader2, CheckCircle } from "lucide-react"
import { useLayerStore } from "../../store/useLayerStore"
import html2canvas from 'html2canvas'

// Redimensiona para 14x5.8cm a 300dpi = 1654x685px
const TARGET_W = 1654
const TARGET_H = 685

const resizeImage = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = TARGET_W
      canvas.height = TARGET_H
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, TARGET_W, TARGET_H)
      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.src = dataUrl
  })
}

export const S12Modal = ({ onClose }: { onClose: () => void }) => {
  const { selectedFeature, layers } = useLayerStore()
  const [status, setStatus] = useState<'idle' | 'capturing' | 'generating' | 'done' | 'error'>('idle')

  if (!selectedFeature) return null

  const currentLayer = layers.find((l) => l.id === selectedFeature.layerId)
  const locality = currentLayer?.name || "Localidade"
  const featureName = selectedFeature.feature.properties?.name || "S/N"

  const handleGenerate = async () => {
    const captureArea = document.getElementById("map-capture-area")
    if (!captureArea) return
  
    try {
      setStatus('capturing')
  
      if (!window.electronAPI) throw new Error('electronAPI nao disponivel')
  
      // Captura nativa da janela via Electron
      const capture = await window.electronAPI.captureMap()
      if (!capture.success || !capture.dataUrl) throw new Error(capture.error)
  
      // Recorta a área do visor
      const areaRect = captureArea.getBoundingClientRect()
      const scale = window.devicePixelRatio || 1
  
      const img = new Image()
      await new Promise(r => { img.onload = r; img.src = capture.dataUrl! })
  
      const cropCanvas = document.createElement('canvas')
      cropCanvas.width = areaRect.width * scale
      cropCanvas.height = areaRect.height * scale
      const ctx = cropCanvas.getContext('2d')!
      ctx.drawImage(
        img,
        areaRect.left * scale,
        areaRect.top * scale,
        areaRect.width * scale,
        areaRect.height * scale,
        0, 0,
        areaRect.width * scale,
        areaRect.height * scale
      )
  
      // Redimensiona para 14x5.8cm @ 300dpi
      setStatus('generating')
      const resized = await resizeImage(cropCanvas.toDataURL('image/jpeg', 0.95))
  
      const result = await window.electronAPI.saveMapCard({
        imageBase64: resized,
        featureName,
        locality,
      })
  
      if (!result.success) throw new Error(result.error)
  
      setStatus('done')
      setTimeout(() => onClose(), 1500)
  
    } catch (err) {
      console.error('Erro ao gerar cartão:', err)
      setStatus('error')
    }
  }

  const buttonLabel = {
    idle: 'Gerar Cartão S-12',
    capturing: 'Capturando...',
    generating: 'Gerando PDF...',
    done: 'Salvo!',
    error: 'Erro — tentar novamente',
  }[status]

  const isLoading = status === 'capturing' || status === 'generating'

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none overflow-hidden bg-transparent">
      {/* BOTÕES */}
      <div className="absolute top-8 right-8 flex gap-4 z-[10001] pointer-events-auto">
        <button
          onClick={handleGenerate}
          disabled={isLoading || status === 'done'}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-6 py-3 rounded-full font-bold shadow-2xl transition-all active:scale-95 border border-emerald-400/20"
        >
          {isLoading && <Loader2 size={20} className="animate-spin" />}
          {status === 'done' && <CheckCircle size={20} />}
          {!isLoading && status !== 'done' && <FileText size={20} />}
          {buttonLabel}
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-full text-white transition-all shadow-xl border border-white/10"
        >
          <X size={24} />
        </button>
      </div>

      {/* VISOR */}
      <div className="relative flex flex-col items-center pointer-events-none w-[90vw] max-w-[1200px]">
        <div
          id="map-capture-area"
          style={{ width: "100%", aspectRatio: "14 / 5.8" }}
          className="border-[1.5px] border-yellow-400 relative shadow-[0_0_0_100vmax_rgba(0,0,0,0.7)]"
        >
          <div className="absolute -top-6 left-0 text-yellow-400 text-[10px] font-black uppercase tracking-widest bg-black/60 px-2 py-0.5">
            Área de Impressão (14×5.8cm)
          </div>
        </div>

        <div className="mt-10 text-center text-white drop-shadow-2xl">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            {locality}
          </h2>
          <div className="h-[2px] w-40 bg-yellow-400/50 mx-auto my-3" />
          <p className="text-sm font-bold opacity-80 uppercase tracking-[0.3em]">
            Território — {featureName}
          </p>
        </div>
      </div>
    </div>
  )
}