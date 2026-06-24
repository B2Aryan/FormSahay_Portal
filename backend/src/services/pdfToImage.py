import sys, json, base64, io
import fitz

def pdf_page_to_png(pdf_data: bytes, page_num: int = 0, dpi: int = 200) -> bytes:
    doc = fitz.open(stream=pdf_data, filetype='pdf')
    if page_num >= len(doc):
        page_num = 0
    page = doc[page_num]
    matrix = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=matrix)
    img_bytes = pix.tobytes('png')
    doc.close()
    return img_bytes

def extract_text_pymupdf(pdf_data: bytes) -> str:
    doc = fitz.open(stream=pdf_data, filetype='pdf')
    text = ''
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

if __name__ == '__main__':
    raw = sys.stdin.buffer.read()
    if not raw:
        print(json.dumps({'error': 'No input data'}))
        sys.exit(1)
    try:
        pdf_data = base64.b64decode(raw.strip())
    except Exception:
        pdf_data = raw
    try:
        mode = sys.argv[1] if len(sys.argv) > 1 else 'both'
        result = {}
        if mode in ('text', 'both'):
            text = extract_text_pymupdf(pdf_data)
            result['text'] = text
        if mode in ('image', 'both'):
            png_bytes = pdf_page_to_png(pdf_data)
            result['image_base64'] = base64.b64encode(png_bytes).decode()
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
