FROM node:20-bookworm-slim

# Install Python 3 + pip for PyMuPDF OCR
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/render/project/src/backend

# Install Python dependencies
COPY requirements.txt .
RUN python3 -m pip install --no-cache-dir --break-system-packages -r requirements.txt

# Install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose backend port
EXPOSE 5000

CMD ["node", "src/index.js"]
