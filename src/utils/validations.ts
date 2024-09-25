import moment from 'moment';

export const validateInput = (image: string | undefined, customer_code: any, measure_datetime: any, measure_type: string) => {
  const errors = [];
  
  if (!image) { 
    errors.push('image is required');
  }
  if (!customer_code) {
    errors.push('customer_code is required');
  }
  if (!measure_datetime) {
    errors.push('measure_datetime is required.');
  }
  if (!measure_type) {
    errors.push('measure_type is required.');
  }

  if (!["WATER", "GAS"].includes(measure_type.toUpperCase())) {
    errors.push('measure_type must be WATER or GAS');
  }

  if (!moment(measure_datetime, moment.ISO_8601, true).isValid()) {
    errors.push('measure_datetime must be in ISO 8601 format (e.g., 2024-05-20T12:00:00Z)');
  }
  
  return errors;
};
