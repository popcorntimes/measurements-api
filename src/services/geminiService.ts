import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { GeminiService } from '../interfaces/geminiService.interface';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const configuration = new GoogleGenerativeAI(apiKey!);
const fileManager = new GoogleAIFileManager(apiKey!);

const modelId = 'gemini-1.5-pro';
const model = configuration.getGenerativeModel({ model: modelId });

const cache: Map<string, string> = new Map(); 

export const geminiService: GeminiService = {
  processImage: async (imageBase64: string, customer_code: string, measure_datetime: string, measure_type: string) => {
    const cacheKey = `${customer_code}-${measure_datetime}-${measure_type}`;

    // Verifica se o resultado está em cache
    if (cache.has(cacheKey)) {
      console.log(`Resultado em cache encontrado para: ${cacheKey}`);
      return cache.get(cacheKey)!;
    }

    const maxAttempts = 3;
    let attempt = 0;
    let responseText: string | undefined;

    while (attempt < maxAttempts) {
      try {
        const imageBuffer = Buffer.from(imageBase64, 'base64');
        const tempFilePath = path.join(os.tmpdir(), 'image.jpg');
        fs.writeFileSync(tempFilePath, imageBuffer);

        const uploadResponse = await fileManager.uploadFile(tempFilePath, {
          mimeType: "image/jpeg",
          displayName: "Image",
        });

        console.log(`Arquivo enviado ${uploadResponse.file.displayName} como: ${uploadResponse.file.uri}`);

        const prompt = `Leia a medição na imagem e retorne apenas o valor numérico`;

        console.log(`Enviando prompt para o modelo: ${prompt}`);

        const result = await model.generateContent([
          {
            fileData: {
              mimeType: uploadResponse.file.mimeType,
              fileUri: uploadResponse.file.uri
            }
          },
          { text: prompt },
        ]);

        console.log(`Resposta da API: ${JSON.stringify(result.response)}`);

        responseText = result.response.text();

        if (!responseText) {
          throw new Error('Resposta da API está vazia.');
        }

        // Armazena o resultado no cache
        cache.set(cacheKey, responseText);

        fs.unlinkSync(tempFilePath);
        return responseText;

      } catch (err) {
        if (err instanceof Error) {
          console.error(`Erro ao processar a imagem com o Gemini (tentativa ${attempt + 1}):`, err.message);
        } else {
          console.error('Erro desconhecido ao processar a imagem com o Gemini:', err);
        }

        attempt++;
        if (attempt === maxAttempts) {
          throw new Error('Falha ao processar a imagem após várias tentativas.');
        }
      }
    }

    throw new Error('Falha ao processar a imagem após várias tentativas.');
  },
};
