import sys, json, base64, io
from PIL import Image
import pytesseract

def ocr_image(image_data: bytes, lang: str = 'eng+hin') -> dict:
    img = Image.open(io.BytesIO(image_data)).convert('RGB')
    data = pytesseract.image_to_data(img, lang=lang, output_type=pytesseract.Output.DICT)
    text = pytesseract.image_to_string(img, lang=lang).strip()
    confidences = [int(c) for c in data['conf'] if c != '-1']
    avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0
    return {
        'text': text,
        'confidence': avg_confidence,
        'success': len(text) > 0
    }

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
        print(json.dumps({'error': str(e), 'success': False}))
        sys.exit(1)
