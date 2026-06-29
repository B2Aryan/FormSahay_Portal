const { spawn } = require('child_process');
const Tesseract = require('tesseract.js');
const path = require('path');

const PYTHON = process.env.OCR_PYTHON_PATH || 'python3';
const PDF_TO_IMAGE = path.join(__dirname, 'pdfToImage.py');
const PADDLE_OCR = path.join(__dirname, 'paddleOcr.py');

function runPython(scriptPath, args, inputData) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON, [scriptPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python exited code ${code}: ${stderr.slice(0, 300).trim()}`));
      } else {
        try { resolve(JSON.parse(stdout)); }
        catch (e) { reject(new Error('Invalid JSON from Python')); }
      }
    });
    child.on('error', reject);
    if (inputData) { child.stdin.write(inputData); }
    child.stdin.end();
  });
}

const extractText = async (fileBuffer, mimeType, originalName) => {
  const isPdf = mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
  const inputB64 = fileBuffer.toString('base64');

  // --- PDF path: PyMuPDF text extraction, fallback to Tesseract ---
  if (isPdf) {
    console.log(`📄 Parsing PDF via PyMuPDF: ${originalName}`);
    try {
      const pdfResult = await runPython(PDF_TO_IMAGE, ['both'], inputB64);
      const text = (pdfResult.text || '').trim();
      if (text.length > 20) {
        console.log(`✅ Extracted ${text.length} characters of selectable text from PDF.`);
        return { text, method: 'pymupdf', success: true };
      }
      console.log(`⚠️ Selectable text too short (${text.length} chars). Running OCR...`);
      if (pdfResult.image_base64) {
        const imgBuffer = Buffer.from(pdfResult.image_base64, 'base64');
        return await runTesseract(imgBuffer, originalName);
      }
    } catch (err) {
      console.error('PyMuPDF error:', err.message);
      return await runTesseract(fileBuffer, originalName);
    }
  }

  // --- Image path (or any non-PDF) ---
  return await runTesseract(fileBuffer, originalName);
};

async function runTesseract(imageBuffer, originalName) {
  let worker = null;
  try {
    console.log(`📷 Running Tesseract OCR on ${originalName}`);
    worker = await Tesseract.createWorker('eng+hin', 1, {
      cachePath: path.join(__dirname, '../../')
    });
    const { data: { text, confidence } } = await worker.recognize(imageBuffer).catch(() => {
      return { data: { text: '', confidence: 0 } };
    });
    console.log(`✅ Tesseract complete. Confidence: ${confidence}%. ${text.trim().length} chars.`);
    return {
      text: text.trim(),
      method: 'tesseract',
      confidence,
      success: text.trim().length > 0,
    };
  } catch (err) {
    console.error('Tesseract error:', err.message);
    return { text: '', method: 'tesseract', success: false, error: err.message };
  } finally {
    if (worker) {
      try { await worker.terminate(); } catch (e) { /* ignore */ }
    }
  }
}

module.exports = { extractText };
