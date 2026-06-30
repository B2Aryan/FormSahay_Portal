const { createWorker } = require('tesseract.js');
const { spawn } = require('child_process');
const path = require('path');

const PYTHON = process.env.OCR_PYTHON_PATH || 'python3';
const PDF_TO_IMAGE = path.join(__dirname, 'pdfToImage.py');

let tesseractWorker = null;
let tesseractReady = false;

async function getTesseractWorker() {
  if (!tesseractReady) {
    console.log('⏳ Initializing Tesseract.js worker (first run downloads WASM + traineddata)...');
    tesseractWorker = await createWorker('eng+hin');
    tesseractReady = true;
    console.log('✅ Tesseract.js worker ready');
  }
  return tesseractWorker;
}

function runPdfToImage(inputB64) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON, [PDF_TO_IMAGE, 'both'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('close', (code) => {
      if (stderr.trim()) console.log(`[Python stderr] ${stderr.trim()}`);
      if (code !== 0) {
        reject(new Error(`Python exited code ${code}: ${stderr.slice(0, 300).trim()}`));
      } else {
        try { resolve(JSON.parse(stdout)); }
        catch (e) { reject(new Error('Invalid JSON from Python')); }
      }
    });
    child.on('error', reject);
    if (inputB64) { child.stdin.write(inputB64); }
    child.stdin.end();
  });
}

async function runTesseractOcr(imageBuffer, originalName) {
  console.log(`🔍 Running Tesseract.js OCR on ${originalName}`);
  try {
    const worker = await getTesseractWorker();
    const { data } = await worker.recognize(imageBuffer);
    const text = (data.text || '').trim();
    console.log(`✅ Tesseract.js complete. Confidence: ${data.confidence}%. ${text.length} chars.`);
    return {
      text,
      method: 'tesseract.js',
      confidence: data.confidence || 0,
      success: text.length > 0,
    };
  } catch (err) {
    console.error('Tesseract.js error:', err.message);
    return { text: '', method: 'tesseract.js', success: false, error: err.message };
  }
}

const extractText = async (fileBuffer, mimeType, originalName) => {
  const isPdf = mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
  const inputB64 = fileBuffer.toString('base64');

  // --- PDF path: PyMuPDF text extraction, fallback to Tesseract.js ---
  if (isPdf) {
    console.log(`📄 Parsing PDF via PyMuPDF: ${originalName}`);
    try {
      const pdfResult = await runPdfToImage(inputB64);
      const text = (pdfResult.text || '').trim();
      if (text.length > 20) {
        console.log(`✅ Extracted ${text.length} characters of selectable text from PDF.`);
        return { text, method: 'pymupdf', success: true };
      }
      console.log(`⚠️ Selectable text too short (${text.length} chars). Running Tesseract.js on rendered image...`);
      if (pdfResult.image_base64) {
        const imgBuffer = Buffer.from(pdfResult.image_base64, 'base64');
        return await runTesseractOcr(imgBuffer, originalName);
      }
    } catch (err) {
      console.error('PyMuPDF error:', err.message);
      const ocrResult = await runTesseractOcr(fileBuffer, originalName);
      return { ...ocrResult, method: 'tesseract.js' };
    }
  }

  // --- Image path: Tesseract.js directly ---
  const result = await runTesseractOcr(fileBuffer, originalName);
  return { ...result, method: 'tesseract.js' };
};

// Warm up worker at startup
getTesseractWorker().catch(err => console.error('Tesseract.js warmup failed:', err.message));

module.exports = { extractText };
