import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/uploadController';
import { GeminiService } from '../interfaces/geminiService.interface';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({ dest: 'img/' });

export const uploadRoutes = (geminiService: GeminiService): Router => {
  const router = Router();
  const controller = uploadController(geminiService);

  // Error handling middleware
  const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    if (err.message === 'Error processing image: Invalid measurement value') {
      res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: 'Error processing image, invalid measurement value',
      });
    } else {
      res.status(500).json({ error: 'Error processing image' });
    }
    // Note: No need to call next() after sending a response
  };

  router.post('/', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
    const imagePath = req.file?.path;
    const { customer_code, measure_datetime, measure_type } = req.body;

    const missingFields = [];
    if (!imagePath) missingFields.push('image');
    if (!customer_code) missingFields.push('customer_code');
    if (!measure_datetime) missingFields.push('measure_datetime');
    if (!measure_type) missingFields.push('measure_type');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: `The following fields are required: ${missingFields.join(', ')}`,
      });
    }

    try {
      const measure_uuid = uuidv4();

      if (imagePath) {
        await controller.handle(req, res, measure_uuid, req.body.measure_value, imagePath);
        return; // Ensure no further processing after sending a response
      } else {
        return res.status(400).json({ error: 'Image path is unavailable' });
      }
    } catch (error) {
      // Pass the error to the error handling middleware
      next(error);
    }
  });

  // Apply the error handler middleware
  router.use(errorHandler);

  return router;
};