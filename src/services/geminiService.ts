import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as dotenv from 'dotenv';
import { IGeminiService } from '../interfaces/IGeminiService';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const configuration = new GoogleGenerativeAI(apiKey!);
const fileManager = new GoogleAIFileManager(apiKey!);
const modelId = 'gemini-1.5-pro';
const model = configuration.getGenerativeModel({ model: modelId });

// Interface para o resultado do cache
interface CacheResult {
  value: string;
  timestamp: number;
}

const cache: Map<string, CacheResult> = new Map();
const cacheExpirationTime = 60 * 60 * 1000; // 1 hora em milissegundos

export class GeminiServiceImpl implements IGeminiService {
  async processImage(imagePath: string, customer_code: string, measure_datetime: string, measure_type: string): Promise<string> {
    const cacheKey = `${customer_code}-${measure_datetime}-${measure_type}`;

    // Verifica se o resultado está em cache e se ainda é válido
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && cachedResult.timestamp > Date.now() - cacheExpirationTime) {
      //console.log(`Cached result found: ${cacheKey}`);
      return cachedResult.value;
    }

    let tempFilePath = ''; // Inicializa tempFilePath

    try {
      // Lê o arquivo e converte a imagem para base64
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      // Cria um arquivo temporário com o buffer da imagem em base64
      tempFilePath = path.join(os.tmpdir(), 'image.jpg');
      fs.writeFileSync(tempFilePath, Buffer.from(imageBase64, 'base64'));

      // Faz o upload da imagem para o Google
      const uploadResponse = await fileManager.uploadFile(tempFilePath, {
        mimeType: 'image/jpeg',
        displayName: path.basename(imagePath),
      });

      //console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

      // Prompt que será enviado ao modelo
      const prompt = `Read the measurement in the digital meter and return only its numerical value. If it's not a digital meter, don't return anything.`;

      // Gera o conteúdo baseado na imagem e no prompt
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        { text: prompt },
      ]);

      const responseText = result.response.text();

      if (!responseText) {
        throw new Error('Empty API response');
      }

      if (isNaN(Number(responseText))) {
        throw new Error('Error processing image: Invalid measurement value');
      }

      // Armazena o resultado no cache com timestamp
      cache.set(cacheKey, { value: responseText, timestamp: Date.now() });

      return responseText;
    } catch (error) {
      console.error(`Error processing image with Gemini`, error);
      throw new Error('Error processing image'); 
    } finally {
      // Remove o arquivo temporário, se existir
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        //console.log(`Temp file removed: ${tempFilePath}`);
      }
    }
  }
}