FROM node:18

WORKDIR /usr/src/app

RUN git clone -b feature/database https://github.com/popcorntimes/measurements-api .

COPY package*.json ./

RUN npm install

# Instalar o Tesseract OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-por \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g typescript

COPY . .

# Limpar o diretório de build e recompilar
RUN rm -rf dist/ && npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run build && npm start"]