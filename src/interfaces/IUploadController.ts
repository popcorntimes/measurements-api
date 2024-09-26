import { Request, Response } from 'express';

export interface IUploadController {
  handle(req: Request, res: Response): Promise<Response>;
}