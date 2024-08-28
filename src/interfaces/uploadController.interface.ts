import { Request, Response } from 'express';
import { GeminiService } from '../interfaces/geminiService.interface';

export interface UploadController {
    (geminiService: GeminiService): {
      handle(req: Request, res: Response): Promise<Response>;
    };
}