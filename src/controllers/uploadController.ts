import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GeminiService } from '../interfaces/geminiService.interface';
import { validateInput } from '../utils/validations';
import { Pool, QueryResult } from 'pg'; 

const pool = new Pool({
  user: 'postgres',
  host: 'db', 
  database: 'measurements',
  password: 'yourpassword', 
  port: 5432,
});

export const generateRandomImageUrl = (): string => {
  const uniqueIdentifier = uuidv4();
  return `https://randomimage.com/${uniqueIdentifier}.jpg`;
};

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

export const uploadController = (geminiService: GeminiService) => ({
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

      const clientQuery: QueryResult<any> = await pool.query(
        'SELECT * FROM customer_measures WHERE customer_code = $1',
        [customer_code]
      );

      if (clientQuery.rowCount === 0) {
        await pool.query(
          'INSERT INTO customer_measures (customer_code) VALUES ($1)',
          [customer_code]
        );
      }

      const measuresQuery: QueryResult<any> = await pool.query(
        'SELECT * FROM measures WHERE customer_code = $1 AND measure_datetime::DATE = $2 AND measure_type = $3',
        [customer_code, measure_datetime, measure_type]
      );

      if (measuresQuery.rowCount !== null && measuresQuery.rowCount > 0) {
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
        image_url: generateRandomImageUrl(),
        measure_value,
      };

      await pool.query(
        'INSERT INTO measures (measure_uuid, measure_datetime, measure_type, has_confirmed, image_url, measure_value, customer_code) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          newMeasure.measure_uuid,
          newMeasure.measure_datetime,
          newMeasure.measure_type,
          newMeasure.has_confirmed,
          newMeasure.image_url,
          newMeasure.measure_value,
          customer_code,
        ]
      );

      return res.status(200).json({
        image_url: newMeasure.image_url,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.measure_uuid,
      });
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      return res.status(500).json({
        error_code: 'INTERNAL_SERVER_ERROR',
        error_description: 'Erro interno do servidor.',
      });
    }
  },
});
