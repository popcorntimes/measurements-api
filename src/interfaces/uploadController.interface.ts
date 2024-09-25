import { Request, Response } from 'express';

export interface UploadController {
  handle(req: Request, res: Response, measure_uuid: string, measure_value: string, image_url: string): Promise<Response>;
}