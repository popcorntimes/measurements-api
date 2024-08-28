import { Router } from 'express';
import { UploadController } from '../interfaces/uploadController.interface';
import { GeminiService } from '../interfaces/geminiService.interface';

export const uploadRoutes = (uploadController: UploadController, geminiService: GeminiService) => {
  const router = Router();
  const controller = uploadController(geminiService);
  router.post('/', controller.handle);
  return router;
};