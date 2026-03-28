import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { MapView } from './components/map/MapView'
import { useLayerStore } from './store/useLayerStore'

function App() {
  const bootLayers = useLayerStore((state) => state.bootLayers)
  const isPrinting = useLayerStore((state) => state.isPrinting)
  const isBooting = useLayerStore((state) => state.isBooting)

  useEffect(() => {
    bootLayers()
  }, [bootLayers])

  if (isBooting) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-slate-600 text-xs uppercase tracking-[0.3em] animate-pulse">
          Carregando...
        </span>
      </div>
    )
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex">
      <div className="flex-1 relative h-full overflow-hidden">
        <MapView />
      </div>
      <div className={isPrinting ? 'hidden' : 'contents'}>
        <Sidebar />
      </div>
    </main>
  )
}

export default App