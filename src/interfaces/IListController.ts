import { Request, Response } from 'express';

export interface IListController {
  listAllMeasures(req: Request, res: Response): Promise<Response>;
  handle(req: Request, res: Response): Promise<Response>; 
}