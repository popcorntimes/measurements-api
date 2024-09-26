import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { IUploadController } from '../interfaces/IUploadController';
import { IGeminiService } from '../interfaces/IGeminiService';
import { validateInput } from '../utils/validations';
import { IMeasuresService } from '../interfaces/IMeasuresService';

export class UploadControllerImpl implements IUploadController {
  private geminiService: IGeminiService;
  private measuresService: IMeasuresService;

  constructor(geminiService: IGeminiService, measuresService: IMeasuresService) {
    this.geminiService = geminiService;
    this.measuresService = measuresService;
  }

  handle = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { customer_code, measure_datetime, measure_type } = req.body;
      const image = req.file?.path;

      // 1. Validação dos dados de entrada
      const validationErrors = validateInput(image, customer_code, measure_datetime, measure_type);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: validationErrors.join(', '),
        });
      }

      if (!image) {
        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: 'Image file was not provided',
        });
      }

      // 2. Verificar se já existe uma leitura para o cliente e tipo no mês atual
      const existingMeasure = await this.measuresService.findMeasureForCurrentMonth(customer_code, measure_datetime, measure_type);

      if (existingMeasure) {
        return res.status(409).json({
          error_code: 'DOUBLE_REPORT',
          error_description: 'Reading of the month already taken',
        });
      }

      // 3. Consulta a API do Gemini
      const measure_value = await this.geminiService.processImage(image, customer_code, measure_datetime, measure_type);

      // 4. Salvar a medição no banco de dados
      const newMeasure = {
        measure_uuid: uuidv4(),
        measure_datetime,
        measure_type,
        has_confirmed: false,
        image_url: `https://randomimage.com/${uuidv4()}.jpg`, // Exemplo de URL
        measure_value,
        customer_code,
      };

      await this.measuresService.createMeasure(newMeasure);

      // 5. Retornar a resposta com sucesso
      return res.status(200).json({
        image_url: newMeasure.image_url,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.measure_uuid,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).json({ error: 'Error processing image' });
    }
  };
}