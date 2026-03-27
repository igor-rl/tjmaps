import { PDFDocument, PDFName, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";

const PATHS = {
  template: "./public/data/templates/s12tba.pdf",
  tempImage: (name) => `./public/data/temp/${name}`,
  output: (name) => `./public/data/output/${name}`,
};

/**
 * @param {string} imageFileName - Ex: "example.jpg"
 * @param {string} outputFileName - Ex: "territorio_25_final.pdf"
 * @param {string} localidade - Texto da localidade
 * @param {string} territorio - Texto do território
 */
async function generateS12(
  imageFileName,
  outputFileName,
  localidade,
  territorio,
) {
  try {
    const pdfPath = PATHS.template;
    const imagePath = PATHS.tempImage(imageFileName);
    const resultPath = PATHS.output(outputFileName);

    if (!fs.existsSync(pdfPath) || !fs.existsSync(imagePath)) {
      console.error(`❌ Erro: Arquivos base não encontrados em ./public/data/`);
      return;
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const imageBuffer = fs.readFileSync(imagePath);

    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });
    const page = pdfDoc.getPages()[0];

    // --- LIMPEZA DE WIDGETS (Sua lógica de remoção de botões) ---
    try {
      page.node.delete(PDFName.of("Annots"));
    } catch (e) {}
    try {
      pdfDoc.catalog.delete(PDFName.of("AcroForm"));
    } catch (e) {}

    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();
    const image = await pdfDoc.embedJpg(imageBuffer);

    // --- COORDENADAS ---
    const imgW = 396.85;
    const imgH = 164.41;
    const imgX = 9.28;
    const imgY = height - 47.29 - imgH;

    // AJUSTE: Descendo mais 1 ponto (era +2, agora +1 para colar mais na linha)
    const baseTextY = height - 41 + 1;

    // --- DESENHO ---

    // 1. Retângulo branco (Limpeza de fundo)
    page.drawRectangle({
      x: imgX - 1,
      y: imgY - 1,
      width: imgW + 2,
      height: imgH + 2,
      color: rgb(1, 1, 1),
    });

    // 2. Imagem do mapa
    page.drawImage(image, {
      x: imgX,
      y: imgY,
      width: imgW,
      height: imgH,
    });

    // 3. Texto: Localidade
    page.drawText(localidade, {
      x: 84.71,
      y: baseTextY,
      size: 9,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });

    // 4. Texto: Território
    page.drawText(territorio, {
      x: 337.31,
      y: baseTextY,
      size: 10,
      font: fontNormal,
      color: rgb(0, 0, 0),
    });

    // --- SALVAR ---
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(resultPath, pdfBytes);

    console.log(`✅ Gerado: ${outputFileName}`);
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

// --- EXECUÇÃO DE TESTE ---
// Aqui você define os nomes dinamicamente
generateS12("example.jpg", "ruaral-025-prainha.pdf", "Prainha", "25");
