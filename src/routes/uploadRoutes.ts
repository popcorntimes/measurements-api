import { Router } from 'express';
import multer from 'multer';
import { IUploadController } from '../interfaces/IUploadController';

const upload = multer({ dest: 'img/' });

export const createUploadRoutes = (uploadController: IUploadController) => {
  const router = Router();

  // Middleware para tratar erros
  const errorHandler = (err: Error, req: any, res: any, next: any) => { // Ajustar tipos conforme necessário
    console.error(err.stack);
    if (err.message === 'Error processing image: invalid measurement value') {
      res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Error processing image, invalid measurement value',
      });
    } else {
      res.status(500).json({ error: 'Error processing image' });
    }
  };

  router.post('/', upload.single('image'), async (req, res, next) => {
    try {
      return await uploadController.handle(req, res); 
    } catch (error) {
      next(error);
    }
  });

  router.use(errorHandler);

  return router;
};