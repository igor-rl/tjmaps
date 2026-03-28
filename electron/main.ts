import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'

const isDev = !app.isPackaged

// Pasta onde os .tjlayer são persistidos
const getLayersDir = () => {
  const dir = path.join(app.getPath('userData'), 'layers')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

const getOutputDir = () => {
  const dir = path.join(app.getPath('documents'), 'TJMaps', 'S12')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function registerIpcHandlers() {
  // Salva (cria ou atualiza) um layer no disco
  ipcMain.handle('layer:save', async (_event, layer: any) => {
    try {
      const filePath = path.join(getLayersDir(), `${layer.id}.tjlayer`)
      fs.writeFileSync(filePath, JSON.stringify(layer, null, 2), 'utf-8')
      return { ok: true }
    } catch (err: any) {
      return { ok: false, error: err.message }
    }
  })

  // Carrega todos os .tjlayer da pasta
  ipcMain.handle('layer:loadAll', async () => {
    try {
      const dir = getLayersDir()
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tjlayer'))
      const layers = files.map((f) => {
        const content = fs.readFileSync(path.join(dir, f), 'utf-8')
        return JSON.parse(content)
      })
      return { ok: true, layers }
    } catch (err: any) {
      return { ok: false, layers: [], error: err.message }
    }
  })

  // Remove um .tjlayer pelo id
  ipcMain.handle('layer:delete', async (_event, id: string) => {
    try {
      const filePath = path.join(getLayersDir(), `${id}.tjlayer`)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      return { ok: true }
    } catch (err: any) {
      return { ok: false, error: err.message }
    }
  })

  // Salva imagem S-12 em Documents/TJMaps/S12
  ipcMain.handle('s12:saveImage', async (_event, buffer: ArrayBuffer, fileName: string) => {
    try {
      const outputDir = getOutputDir()
      const filePath = path.join(outputDir, fileName)
      fs.writeFileSync(filePath, Buffer.from(buffer))
      shell.showItemInFolder(filePath)
      return { ok: true, filePath }
    } catch (err: any) {
      return { ok: false, error: err.message }
    }
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#020617',
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})