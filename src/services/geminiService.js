"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
const configuration = new generative_ai_1.GoogleGenerativeAI(apiKey);
const fileManager = new server_1.GoogleAIFileManager(apiKey);
const modelId = 'gemini-1.5-pro';
const model = configuration.getGenerativeModel({ model: modelId });
const cache = new Map(); // Mapa para armazenar o cache de resultados
exports.geminiService = {
    processImage: (imageBase64, customer_code, measure_datetime, measure_type) => __awaiter(void 0, void 0, void 0, function* () {
        const cacheKey = `${customer_code}-${measure_datetime}-${measure_type}`;
        // Verifica se o resultado está em cache
        if (cache.has(cacheKey)) {
            console.log(`Resultado em cache encontrado para: ${cacheKey}`);
            return cache.get(cacheKey);
        }
        const maxAttempts = 3;
        let attempt = 0;
        let responseText;
        while (attempt < maxAttempts) {
            try {
                const imageBuffer = Buffer.from(imageBase64, 'base64');
                const tempFilePath = path.join(os.tmpdir(), 'image.jpg');
                fs.writeFileSync(tempFilePath, imageBuffer);
                const uploadResponse = yield fileManager.uploadFile(tempFilePath, {
                    mimeType: "image/jpeg",
                    displayName: "Image",
                });
                console.log(`Arquivo enviado ${uploadResponse.file.displayName} como: ${uploadResponse.file.uri}`);
                const prompt = `Leia a medição na imagem e retorne apenas o valor numérico`;
                console.log(`Enviando prompt para o modelo: ${prompt}`);
                const result = yield model.generateContent([
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
            }
            catch (err) {
                if (err instanceof Error) {
                    console.error(`Erro ao processar a imagem com o Gemini (tentativa ${attempt + 1}):`, err.message);
                }
                else {
                    console.error('Erro desconhecido ao processar a imagem com o Gemini:', err);
                }
                attempt++;
                if (attempt === maxAttempts) {
                    throw new Error('Falha ao processar a imagem após várias tentativas.');
                }
            }
        }
        throw new Error('Falha ao processar a imagem após várias tentativas.');
    }),
};
