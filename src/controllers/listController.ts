import { Request, Response } from 'express';
import { MeasuresService } from '../services/measuresService';

export const listController = (measuresService: MeasuresService) => ({
  handle: async (req: Request, res: Response, customer_code: string, measure_type?: string) => {
    console.log(`Handling request for customer_code: ${customer_code}, measure_type: ${measure_type}`);
    console.log('Handling list request...');
    console.log('Customer Code:', customer_code);
    console.log('Measure Type:', measure_type);

    try {
      // Aqui você adicionaria a lógica para buscar as medidas do banco de dados
      const measures = await measuresService.getMeasures(customer_code, measure_type);
      if (measures.length === 0) {
        console.log('No measures found for customer:', customer_code);
        return res.status(404).json({
          error_code: 'MEASURES_NOT_FOUND',
          error_description: 'Nenhuma leitura encontrada',
        });
      }

      return res.status(200).json({
        customer_code,
        measures,
      });
    } catch (error) {
      console.error('Error fetching measures:', error);
      return res.status(500).json({ error: 'Error fetching measures' });
    }
  },
});
