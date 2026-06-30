const { spawn } = require('child_process');
const path = require('path');

const PYTHON = process.env.OCR_PYTHON_PATH || 'python3';
const PDF_TO_IMAGE = path.join(__dirname, 'pdfToImage.py');
const PYTHON_OCR = path.join(__dirname, 'pythonOcr.py');

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
      if (stderr.trim()) {
        console.log(`[Python stderr] ${stderr.trim()}`);
      }
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

  // --- PDF path: PyMuPDF text extraction, fallback to pytesseract OCR ---
  if (isPdf) {
    console.log(`📄 Parsing PDF via PyMuPDF: ${originalName}`);
    try {
      const pdfResult = await runPython(PDF_TO_IMAGE, ['both'], inputB64);
      const text = (pdfResult.text || '').trim();
      if (text.length > 20) {
        console.log(`✅ Extracted ${text.length} characters of selectable text from PDF.`);
        return { text, method: 'pymupdf', success: true };
      }
      console.log(`⚠️ Selectable text too short (${text.length} chars). Running OCR via Python...`);
      if (pdfResult.image_base64) {
        return await runPythonOcr(pdfResult.image_base64, originalName);
      }
    } catch (err) {
      console.error('PyMuPDF error:', err.message);
      return await runPythonOcr(inputB64, originalName);
    }
  }

  // --- Image path ---
  return await runPythonOcr(inputB64, originalName);
};

async function runPythonOcr(imageB64, originalName) {
  console.log(`🔍 Running Python pytesseract OCR on ${originalName}`);
  try {
    const result = await runPython(PYTHON_OCR, [], imageB64);
    console.log(`✅ Python OCR complete. Confidence: ${result.confidence}%. ${(result.text || '').length} chars.`);
    return {
      text: (result.text || '').trim(),
      method: 'pytesseract',
      confidence: result.confidence || 0,
      success: result.success === true,
    };
  } catch (err) {
    console.error('Python OCR error:', err.message);
    return { text: '', method: 'pytesseract', success: false, error: err.message };
  }
}

module.exports = { extractText };
