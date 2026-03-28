import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  captureMap: () => ipcRenderer.invoke('capture-map'),
  saveMapCard: (payload: {
    imageBase64: string
    featureName: string
    locality: string
  }) => ipcRenderer.invoke('save-map-card', payload)
})