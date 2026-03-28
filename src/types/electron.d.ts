interface ElectronAPI {
  captureMap: () => Promise<{ success: boolean; dataUrl?: string; error?: string }>
  saveMapCard: (payload: {
    imageBase64: string
    featureName: string
    locality: string
  }) => Promise<{ success: boolean; path?: string; error?: string }>
}

declare interface Window {
  electronAPI?: ElectronAPI
}