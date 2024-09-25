import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import * as dotenv from 'dotenv';
import { GeminiService } from '../interfaces/geminiService.interface';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const configuration = new GoogleGenerativeAI(apiKey!);
const fileManager = new GoogleAIFileManager(apiKey!);
const modelId = 'gemini-1.5-pro';
const model = configuration.getGenerativeModel({ model: modelId });

const cache: Map<string, string> = new Map();

export const geminiService: GeminiService = {
  processImage: async (imagePath: string, customer_code: string, measure_datetime: string, measure_type: string) => {
    const cacheKey = `${customer_code}-${measure_datetime}-${measure_type}`;

    // Verifica se o resultado está em cache
    if (cache.has(cacheKey)) {
      console.log(`Cached result for ${cacheKey}`);
      return cache.get(cacheKey)!;
    }

    try {
      //console.log(`Processing image ${imagePath}`);
      console.log(`Parameters - customer_code: ${customer_code}, measure_datetime: ${measure_datetime}, measure_type: ${measure_type}`);

      // Lê o arquivo e converte a imagem para base64
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      //console.log(`Reading image and converting to base 64`);

      // Cria um arquivo temporário com o buffer da imagem em base64
      const tempFilePath = path.join(os.tmpdir(), 'image.jpg');
      fs.writeFileSync(tempFilePath, Buffer.from(imageBase64, 'base64'));
      //console.log(`Temp file created ${tempFilePath}`);

      // Faz o upload da imagem para o Google
      const uploadResponse = await fileManager.uploadFile(tempFilePath, {
        mimeType: "image/jpeg",
        displayName: path.basename(imagePath),
      });

      //console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

      // Prompt que será enviado ao modelo
      const prompt = `Read the measurement in the digital meter and return only its numerical value. If it's not a digital meter, don't return anything.`;
      console.log(`Sending prompt to model: ${prompt}`);

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
      console.log(`API response: ${responseText}`);

      if (!responseText) {
        throw new Error('Empty API response');
      }

      if (isNaN(Number(responseText))) {
        throw new Error('Error processing image: Invalid measurement value');
      }

      // Armazena o resultado no cache
      cache.set(cacheKey, responseText);

      // Remove o arquivo temporário
      fs.unlinkSync(tempFilePath);
      //console.log(`Temp file removed`);

      return responseText;

    } catch (error) {
      console.error(`Error processing image with Gemini`, error);
      return 'Error processing image';
    }
  },
};
