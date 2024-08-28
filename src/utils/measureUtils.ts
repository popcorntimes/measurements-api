import { Measure } from '../controllers/uploadController';

export const measures: { customer_code: string; measures: Measure[] }[] = [];

export function findMeasureForCurrentMonth(customerMeasures: Measure[], measure_datetime: string, measure_type: string): Measure | undefined {
  const measureDate = new Date(measure_datetime);
  const currentMonth = measureDate.getMonth();
  const currentYear = measureDate.getFullYear();

  return customerMeasures.find(measure => {
    const existingMeasureDate = new Date(measure.measure_datetime);

    return (
      existingMeasureDate.getMonth() === currentMonth &&
      existingMeasureDate.getFullYear() === currentYear &&
      measure.measure_type === measure_type
    );
  });
}