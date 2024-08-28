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

export const geminiService: GeminiService = {
  processImage: async (imageBase64: string, customer_code: string, measure_datetime: string, measure_type: string) => {
    try {
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      const tempFilePath = path.join(os.tmpdir(), 'image.jpg'); 
      fs.writeFileSync(tempFilePath, imageBuffer);

      const uploadResponse = await fileManager.uploadFile(tempFilePath, {
        mimeType: "image/jpeg",
        displayName: "Image",
      });

      console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

      const prompt = `Read measurement of type ${measure_type.toLowerCase} in the image and return only the numeric value`;

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri
          }
        },
        { text: prompt },
      ]);

      const responseText = result.response.text();

      fs.unlinkSync(tempFilePath);

      return responseText;

    } catch (error) {
      console.error('Erro ao processar a imagem com o Gemini:', error);
      throw error;
    }
  },
};