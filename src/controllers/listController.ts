import { Request, Response } from 'express';
import { IListController } from '../interfaces/IListController';
import { IMeasuresService } from '../interfaces/IMeasuresService';

export class ListControllerImpl implements IListController {
  constructor(private measuresService: IMeasuresService) {}

  async listAllMeasures(req: Request, res: Response): Promise<Response> {
    try {
      const allMeasures = await this.measuresService.getAllMeasuresGroupedByCustomer();
      return res.status(200).json(allMeasures);
    } catch (error) {
      console.error('Error listing measures:', error);
      return res.status(500).json({ error: 'Error listing measures' });
    }
  }

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const customer_code = req.params.customer_code;
      const measure_type = req.query.measure_type as string;

      const measures = await this.measuresService.getMeasuresByCustomer(customer_code, measure_type);
      return res.status(200).json(measures);
    } catch (error) {
      console.error('Error searching for customer measures:', error);
      return res.status(500).json({ error: 'Error searching for customer measures' });
    }
  }
}