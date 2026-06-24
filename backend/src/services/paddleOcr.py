import sys, json, base64, io, os
from PIL import Image
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_textline_orientation=True, lang='en')

def run_ocr(image_data: bytes) -> dict:
    img = Image.open(io.BytesIO(image_data)).convert('RGB')
    result = ocr.ocr(img, cls=True)
    lines = []
    for page in result:
        if page is None:
            continue
        for line_info in page:
            bbox, (text, confidence) = line_info
            lines.append({
                'text': text,
                'confidence': round(confidence, 4),
                'bbox': [round(v, 2) for v in bbox]
            })
    full_text = '\n'.join(l['text'] for l in lines if l['confidence'] >= 0.5)
    return {'text': full_text, 'lines': lines}

if __name__ == '__main__':
    raw = sys.stdin.buffer.read()
    if not raw:
        print(json.dumps({'error': 'No input data'}))
        sys.exit(1)
    try:
        image_data = base64.b64decode(raw.strip())
    except Exception:
        image_data = raw
    try:
        result = run_ocr(image_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
