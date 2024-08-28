export interface GeminiService {
    processImage(imageBase64: string, customer_code: string, measure_datetime: string, measure_type: string): Promise<string>;
  }