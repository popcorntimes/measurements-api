export interface GeminiService {
    processImage(imageFileName: string, customer_code: string, measure_datetime: string, measure_type: string): Promise<string>;
  }