export interface IGeminiService {
  processImage(imagePath: string, customer_code: string, measure_datetime: string, measure_type: string): Promise<string>;
}