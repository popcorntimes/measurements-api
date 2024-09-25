FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Instalar o Tesseract OCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-por \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar o TypeScript globalmente
RUN npm install -g typescript

COPY . .

# Compilar o TypeScript para JavaScript
RUN npm run build

# Garantir que o código TypeScript seja recompilado ao iniciar
CMD ["sh", "-c", "npm run build && npm start"]

EXPOSE 3000