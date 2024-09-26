import { Request, Response } from 'express';

export interface IConfirmController {
  handle(req: Request, res: Response): Promise<Response>;
}