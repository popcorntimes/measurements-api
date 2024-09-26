import { Measure } from '../models/Measure';

export interface IMeasuresService {
  getMeasuresByCustomer(customer_code: string, measure_type?: string): Promise<Measure[]>;
  getAllMeasuresGroupedByCustomer(): Promise<any[]>;
  getMeasureByUuid(measure_uuid: string): Promise<Measure | undefined>;
  confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<void>;
  createMeasure(newMeasure: Measure): Promise<void>;
  findMeasureForCurrentMonth(customer_code: string, measure_datetime: string, measure_type: string): Promise<Measure | undefined>;
}