import { Router, Request, Response } from 'express';
import { MeasuresService } from '../services/measuresService';
import { listController } from '../controllers/listController';

export const listRoutes = (measuresService: MeasuresService): Router => {
  const router = Router();
  const controller = listController(measuresService);

  router.get('/:customer_code/list', async (req: Request, res: Response) => {
    const { customer_code } = req.params;
    const measure_type = typeof req.query.measure_type === 'string' ? req.query.measure_type : undefined;

    console.log('Received request to list measures for customer:', customer_code);
    console.log('Optional measure type:', measure_type);

    try {
      const response = await controller.handle(req, res, customer_code, measure_type);
      return response;
    } catch (error) {
      console.error('Erro ao listar medidas:', error);
      return res.status(500).json({ error: 'Erro ao listar medidas.' });
    }
  });

  return router;
};
