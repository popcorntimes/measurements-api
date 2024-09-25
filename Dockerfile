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

RUN npm install -g typescript

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]