import { Router } from 'express';
import { IListController } from '../interfaces/IListController';

export const createListRoutes = (listController: IListController) => {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      return await listController.listAllMeasures(req, res);
    } catch (error) {
      console.error('Error listing measures:', error);
      return res.status(500).json({ error: 'Error listing measures' });
    }
  });

  router.get('/:customer_code', async (req, res) => {
    try {
      return await listController.handle(req, res);
    } catch (error) {
      console.error('Error listing measures:', error);
      return res.status(500).json({ error: 'Error listing measures' });
    }
  });

  return router;
};