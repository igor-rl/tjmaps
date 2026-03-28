import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Layer persistence
  saveLayer: (layer: object) => ipcRenderer.invoke('layer:save', layer),
  loadLayers: () => ipcRenderer.invoke('layer:loadAll'),
  deleteLayer: (id: string) => ipcRenderer.invoke('layer:delete', id),

  // S-12 image export (already existed)
  saveS12Image: (buffer: ArrayBuffer, fileName: string) =>
    ipcRenderer.invoke('s12:saveImage', buffer, fileName),
})