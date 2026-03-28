import { X, Camera } from 'lucide-react'
import { useLayerStore } from '../../store/useLayerStore'
import html2canvas from 'html2canvas'

export const S12Modal = ({ onClose }: { onClose: () => void }) => {
  const { selectedFeature, layers } = useLayerStore()

  if (!selectedFeature) return null

  const currentLayer = layers.find((l) => l.id === selectedFeature.layerId)
  const locality = currentLayer?.name || 'Localidade'
  const featureNumber = selectedFeature.feature.number || selectedFeature.feature.name || 'S/N'

  const handleCapture = async () => {
    const screenshotTarget = document.getElementById('map-capture-area')
    if (!screenshotTarget) return

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#020617',
        logging: false,
        ignoreElements: (el) => el.classList.contains('no-print'),
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*')
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement
            const style = window.getComputedStyle(el)
            if (style.backgroundColor.includes('oklch'))
              el.style.backgroundColor = '#020617'
            if (style.color.includes('oklch')) el.style.color = '#ffffff'
            if (style.borderColor.includes('oklch'))
              el.style.borderColor = '#facc15'
            if (el.classList.contains('leaflet-container')) {
              el.style.background = '#020617'
            }
          }
        },
      })

      const cropCanvas = document.createElement('canvas')
      const ctx = cropCanvas.getContext('2d')
      const rect = screenshotTarget.getBoundingClientRect()

      cropCanvas.width = rect.width * 2
      cropCanvas.height = rect.height * 2

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
        )
      }

      const fileName = `S12_${locality.replace(/\s+/g, '_')}_${featureNumber}.jpg`
      const windowAny = window as any

      if (windowAny.electronAPI?.saveS12Image) {
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve) => {
          cropCanvas.toBlob(
            async (b) => resolve(await b!.arrayBuffer()),
            'image/jpeg',
            0.95,
          )
        })
        await windowAny.electronAPI.saveS12Image(arrayBuffer, fileName)
      } else {
        const imageData = cropCanvas.toDataURL('image/jpeg', 0.95)
        const link = document.createElement('a')
        link.href = imageData
        link.download = fileName
        link.click()
      }

      onClose()
    } catch (error) {
      console.error('Erro na captura:', error)
      alert(
        'Erro de renderização. Tente atualizar o html2canvas ou mudar as cores do Tailwind para HEX no arquivo CSS principal.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none no-print overflow-hidden bg-transparent">
      {/* Botões de controle */}
      <div className="absolute top-8 right-8 flex gap-4 z-[10001] pointer-events-auto no-print">
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

      {/* Área do visor */}
      <div className="relative flex flex-col items-center pointer-events-none w-[95vw] max-w-[1600px]">
        <div
          id="map-capture-area"
          style={{ width: '100%', aspectRatio: '14 / 5.8' }}
          className="border-[2px] border-yellow-400 relative shadow-[0_0_0_100vmax_rgba(0,0,0,0.75)]"
        >
          <div className="absolute -top-7 left-0 text-yellow-400 text-[11px] font-black uppercase tracking-[0.2em] bg-black/60 px-3 py-1 rounded-t-sm no-print">
            Área de Impressão (14x5.8cm)
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-20 no-print">
            <div className="w-10 h-[1px] bg-yellow-400 absolute" />
            <div className="h-10 w-[1px] bg-yellow-400 absolute" />
          </div>
        </div>

        <div className="mt-8 text-center text-white drop-shadow-2xl no-print">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            {locality}
          </h2>
          <div className="h-[2px] w-48 bg-yellow-400/50 mx-auto my-4 shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
          <p className="text-sm font-black opacity-90 uppercase tracking-[0.4em]">
            Território Nº {featureNumber}
          </p>
        </div>
      </div>
    </div>
  )
}