import { Request, Response } from 'express';
import { IConfirmController } from '../interfaces/IConfirmController';
import { IMeasuresService } from '../interfaces/IMeasuresService';

export class ConfirmControllerImpl implements IConfirmController {
  constructor(private measuresService: IMeasuresService) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { measure_uuid, confirmed_value } = req.body;

      if (typeof measure_uuid !== 'string' || typeof confirmed_value !== 'number') {
        return res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: 'Invalid data types: measure_uuid must be a string and confirmed_value must be a number',
        });
      }

      const measure = await this.measuresService.getMeasureByUuid(measure_uuid);
      if (!measure) {
        return res.status(404).json({
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Reading not found',
        });
      }

      if (measure.has_confirmed) {
        return res.status(409).json({
          error_code: 'CONFIRMATION_DUPLICATE',
          error_description: 'Reading has already been confirmed',
        });
      }

      await this.measuresService.confirmMeasure(measure_uuid, confirmed_value);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error confirming reading:', error);
      return res.status(500).json({ error: 'Error confirming reading' });
    }
  }
}