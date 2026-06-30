import sys, json, base64, io
from PIL import Image
import pytesseract

def log(msg):
    print(msg, file=sys.stderr)

def ocr_image(image_data: bytes) -> dict:
    img = Image.open(io.BytesIO(image_data)).convert('RGB')
    log(f"Image size: {img.size}, mode: {img.mode}")

    try:
        import subprocess
        ver = subprocess.run(['tesseract', '--version'], capture_output=True, text=True, timeout=10)
        log(f"tesseract --version: {ver.stdout[:200]}")
    except Exception as e:
        log(f"tesseract check: {e}")

    try:
        pytesseract.get_tesseract_version()
    except Exception as e:
        log(f"pytesseract version error: {e}")
        return {'text': '', 'confidence': 0, 'success': False, 'error': str(e)}

    # Try with 'eng' first
    for lang in ('eng', 'eng+hin'):
        try:
            text = pytesseract.image_to_string(img, lang=lang, config='--psm 6').strip()
            log(f"lang={lang}: got {len(text)} chars")
            if text:
                data = pytesseract.image_to_data(img, lang=lang, config='--psm 6', output_type=pytesseract.Output.DICT)
                confidences = [int(c) for c in data['conf'] if c not in ('-1', '')]
                avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0
                return {'text': text, 'confidence': avg_confidence, 'success': True}
        except Exception as e:
            log(f"lang={lang} failed: {e}")

    return {'text': '', 'confidence': 0, 'success': False, 'error': 'No text extracted with any language'}

if __name__ == '__main__':
    raw = sys.stdin.buffer.read()
    if not raw:
        print(json.dumps({'error': 'No input data', 'success': False}))
        sys.exit(1)
    try:
        image_data = base64.b64decode(raw.strip())
    except Exception:
        image_data = raw
    try:
        result = ocr_image(image_data)
        print(json.dumps(result))
    except Exception as e:
        log(f"Fatal error: {e}")
        print(json.dumps({'error': str(e), 'success': False}))
        sys.exit(1)
