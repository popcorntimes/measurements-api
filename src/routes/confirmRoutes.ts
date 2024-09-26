import { Router } from 'express';
import { IConfirmController } from '../interfaces/IConfirmController';

export const createConfirmRoutes = (confirmController: IConfirmController) => {
  const router = Router();

  router.patch('/', async (req, res) => {
    try {
      return await confirmController.handle(req, res);
    } catch (error) {
      console.error('Error confirming measure:', error);
      return res.status(500).json({ error: 'Error confirming measure' });
    }
  });

  return router;
};