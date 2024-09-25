import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GeminiService } from '../interfaces/geminiService.interface';
import { validateInput } from '../utils/validations';
import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'measurements',
  password: 'admin',
  port: 5432,
});

export interface Measure {
  measure_uuid: string;
  measure_datetime: string;
  measure_type: string;
  has_confirmed: boolean;
  image_url: string;
  measure_value: string;
  customer_code: string;
}

export const uploadController = (geminiService: GeminiService) => ({
  handle: async (
    req: Request,
    res: Response,
    measure_uuid: string,
    measure_value: string,
    image_url: string
  ): Promise<Response> => {
    const { customer_code, measure_datetime, measure_type } = req.body;
    const image = req.file?.path;

    // Validação dos dados de entrada
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

    try {
      const clientQuery: QueryResult<any> = await pool.query(
        'SELECT * FROM customer_measures WHERE customer_code = $1',
        [customer_code]
      );

      if (clientQuery.rowCount === 0) {
        await pool.query('INSERT INTO customer_measures (customer_code) VALUES ($1)', [customer_code]);
      }

      const measuresQuery: QueryResult<any> = await pool.query(
        'SELECT * FROM measures WHERE customer_code = $1 AND measure_datetime::DATE = $2 AND measure_type = $3',
        [customer_code, measure_datetime, measure_type]
      );

      if (measuresQuery.rowCount !== null && measuresQuery.rowCount > 0) {
        return res.status(409).json({
          error_code: 'DOUBLE_REPORT',
          error_description: 'Reading of the month already taken',
        });
      }

      const measure_uuid = uuidv4();
      const image_url = `https://randomimage.com/${measure_uuid}.jpg`; // Exemplo de URL

      // Chama o serviço para processar a imagem
      const measure_value = await geminiService.processImage(image, customer_code, measure_datetime, measure_type);

      // Salva a medição no banco de dados
      const newMeasure: Measure = {
        measure_uuid,
        measure_datetime,
        measure_type,
        has_confirmed: false,
        image_url,
        measure_value,
        customer_code,
      };

      await pool.query(
        `INSERT INTO measures (measure_uuid, measure_datetime, measure_type, has_confirmed, image_url, measure_value, customer_code) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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

      // Retorna a resposta final
      return res.status(200).json({
        image_url: newMeasure.image_url,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.measure_uuid,
      });

    } catch (error) {
      console.error('Error processing image:', error);
      
      // Aqui você pode verificar se a resposta já foi enviada
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Error processing image' });
      }
    }

    // Retorno padrão, se tudo falhar (embora esse ponto deva ser inatingível se o código anterior estiver correto)
    return res.status(500).json({ error: 'Unexpected error' });
  },
});
