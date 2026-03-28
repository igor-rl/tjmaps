import { app, BrowserWindow, shell, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { PDFDocument, PDFName, rgb, StandardFonts } from 'pdf-lib'

const isDev = !app.isPackaged

const getOutputDir = () => {
  const dir = path.join(app.getPath('userData'), 'cartoes')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

const getTemplatePath = () => {
  if (isDev) {
    return path.join(process.cwd(), 'public/data/templates/s12tba.pdf')
  }
  return path.join(process.resourcesPath, 'app.asar/dist/data/templates/s12tba.pdf')
}

ipcMain.handle('capture-map', async (event) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender)!
    const image = await win.webContents.capturePage()
    return { success: true, dataUrl: image.toDataURL() }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('save-map-card', async (_event, payload: {
  imageBase64: string
  featureName: string
  locality: string
}) => {
  try {
    const { imageBase64, featureName, locality } = payload

    const safeName = featureName.replace(/\s+/g, '_')
    const outputDir = getOutputDir()

    // 1. Salva JPG temporário
    const jpgPath = path.join(outputDir, `${safeName}_temp.jpg`)
    const base64Data = imageBase64.replace(/^data:image\/jpeg;base64,/, '')
    fs.writeFileSync(jpgPath, Buffer.from(base64Data, 'base64'))

    // 2. Carrega template PDF
    const templatePath = getTemplatePath()
    const pdfBuffer = fs.readFileSync(templatePath)
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true })
    const page = pdfDoc.getPages()[0]
    const { height } = page.getSize()

    // 3. Remove campos do formulário
    try { page.node.delete(PDFName.of('Annots')) } catch {}
    try { pdfDoc.catalog.delete(PDFName.of('AcroForm')) } catch {}
    try {
      const form = pdfDoc.getForm()
      form.getFields().forEach(field => form.removeField(field))
    } catch {}

    // 4. Embed imagem
    const imageBuffer = fs.readFileSync(jpgPath)
    const image = await pdfDoc.embedJpg(imageBuffer)

    // 5. Desenha no PDF
    const imgW = 396.85
    const imgH = 164.41
    const imgX = 9.28
    const imgY = height - 47.29 - imgH
    const baseTextY = height - 41 + 1

    page.drawRectangle({
      x: imgX - 1, y: imgY - 1,
      width: imgW + 2, height: imgH + 2,
      color: rgb(1, 1, 1),
    })

    page.drawImage(image, { x: imgX, y: imgY, width: imgW, height: imgH })

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    page.drawText(locality, {
      x: 84.71, y: baseTextY,
      size: 9, font, color: rgb(0, 0, 0),
    })

    page.drawText(featureName, {
      x: 337.31, y: baseTextY,
      size: 10, font, color: rgb(0, 0, 0),
    })

    // 6. Salva PDF final
    const pdfPath = path.join(outputDir, `${safeName}.pdf`)
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(pdfPath, pdfBytes)

    // 7. Remove JPG temporário
    fs.unlinkSync(jpgPath)

    console.log(`✅ Cartão salvo: ${pdfPath}`)
    return { success: true, path: pdfPath }

  } catch (error: any) {
    console.error('❌ Erro ao gerar cartão:', error)
    return { success: false, error: error.message }
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
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

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Access-Control-Allow-Origin': ['*'],
      },
    })
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})