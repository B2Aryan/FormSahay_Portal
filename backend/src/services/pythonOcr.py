import sys, json, base64, io
from PIL import Image, ImageFilter, ImageOps
import pytesseract

def log(msg):
    print(msg, file=sys.stderr)

def preprocess(img):
    img = img.convert('L')
    img = ImageOps.autocontrast(img, cutoff=5)
    img = img.filter(ImageFilter.SHARPEN)
    return img

def try_ocr(img, lang, psm):
    config = f'--psm {psm} --oem 3'
    text = pytesseract.image_to_string(img, lang=lang, config=config).strip()
    log(f"  psm={psm} lang={lang}: {len(text)} chars")
    if text:
        data = pytesseract.image_to_data(img, lang=lang, config=config, output_type=pytesseract.Output.DICT)
        confs = [int(c) for c in data['conf'] if c not in ('-1', '')]
        conf = round(sum(confs) / len(confs), 2) if confs else 0
        return text, conf
    return None, None

def ocr_image(image_data: bytes) -> dict:
    img = Image.open(io.BytesIO(image_data)).convert('RGB')
    log(f"Original: {img.size} mode={img.mode}")

    extrema = img.convert('L').getextrema()
    log(f"  luminance range: {extrema}")
    bw = img.convert('1')
    white_count = sum(1 for p in bw.getdata() if p)
    log(f"  white pixels: {white_count}/{bw.size[0]*bw.size[1]}")

    processed = preprocess(img)
    log(f"Processed: {processed.size} mode={processed.mode}")

    for lang in ('eng', 'eng+hin'):
        for psm in (3, 6, 4):
            text, conf = try_ocr(processed, lang, psm)
            if text:
                return {'text': text, 'confidence': conf, 'success': True}

    return {'text': '', 'confidence': 0, 'success': False, 'error': 'No text extracted with any language/psm'}

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
