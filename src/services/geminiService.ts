import { createWorker } from 'tesseract.js';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { GeminiService } from '../interfaces/geminiService.interface';

dotenv.config();

export const geminiService: GeminiService = {
  processImage: async (imageUrl: string, customer_code: string, measure_datetime: string, measure_type: string) => {
    try {
      // Baixa a imagem da URL
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');

      // Cria o worker do Tesseract
      const worker = await createWorker(); // Aguardar a Promise aqui

      // Inicializa o worker e carrega o idioma
      await worker.load();
      await worker.setParameters({
        lang: 'por' // Define o idioma para português
      });

      // Realiza o OCR na imagem
      const { data: { text } } = await worker.recognize(imageBuffer);
      console.log(`Texto extraído da imagem: ${text}`);

      // Extrair o valor da medição do texto 
      const measureValue = extractMeasureValueFromText(text);

      // Finaliza o worker do Tesseract
      await worker.terminate();

      return measureValue;

    } catch (err) {
      console.error(`Erro ao processar a imagem com o Tesseract OCR:`, err);
      throw new Error('Falha ao processar a imagem.');
    }
  },
};

// Função para extrair o valor da medição do texto (implemente sua lógica)
function extractMeasureValueFromText(text: string): string {
  // Utilize expressões regulares, manipulação de strings ou bibliotecas específicas
  // para extrair o valor da medição do texto retornado pelo Tesseract.
  // ... (implemente sua lógica aqui) ...

  // Exemplo simples (substitua pela sua lógica específica):
  const match = text.match(/\d+/); 
  return match ? match[0] : '';
}