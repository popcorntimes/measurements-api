import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GeminiService } from '../interfaces/geminiService.interface';
import { validateInput } from '../utils/validations';
import { findMeasureForCurrentMonth, measures } from '../utils/measureUtils';
import { UploadController } from '../interfaces/uploadController.interface';


export interface Measure {
  measure_uuid: string;
  measure_datetime: string;
  measure_type: string;
  has_confirmed: boolean;
  image_url: string;
  measure_value: string;
}

interface CustomerMeasures {
  customer_code: string;
  measures: Measure[];
}

export const uploadController: UploadController = (geminiService: GeminiService) => ({ 
    handle: async (req: Request, res: Response) => {
    try {
      const { image, customer_code, measure_datetime, measure_type } = req.body;

      const validationErrors = validateInput(image, customer_code, measure_datetime, measure_type);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: validationErrors.join(', '),
        });
      }

      let customerMeasures = measures.find(cm => cm.customer_code === customer_code);
      if (!customerMeasures) {
        customerMeasures = { customer_code, measures: [] };
        measures.push(customerMeasures);
      }

      const existingMeasure = findMeasureForCurrentMonth(customerMeasures.measures, measure_datetime, measure_type);
      if (existingMeasure) {
        return res.status(409).json({
          error_code: 'DOUBLE_REPORT',
          error_description: 'Leitura do mês já realizada.',
        });
      }

      const measure_value = await geminiService.processImage(image, customer_code, measure_datetime, measure_type);

      const newMeasure: Measure = {
        measure_uuid: uuidv4(),
        measure_datetime,
        measure_type,
        has_confirmed: false,
        image_url: 'www.imgurl.com/measurement'+`-${measure_datetime}`,
        measure_value,
      };

      customerMeasures.measures.push(newMeasure);

      return res.status(200).json({
        image_url: newMeasure.image_url,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.measure_uuid,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error_code: 'INTERNAL_SERVER_ERROR',
        error_description: 'Erro interno do servidor.',
      });
    }
  },
})