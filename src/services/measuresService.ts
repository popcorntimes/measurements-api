import { Pool } from 'pg';

export class MeasuresService {
    constructor(private db: Pool) {}
  
    async getMeasures(customer_code: string, measure_type?: string) {
      console.log('Fetching measures from the database...');
      console.log('Customer Code:', customer_code);
      console.log('Measure Type:', measure_type);
  
      const query = `
        SELECT * FROM measures 
        WHERE customer_code = $1 
        ${measure_type ? 'AND measure_type = $2' : ''}
      `;
      const values = measure_type ? [customer_code, measure_type] : [customer_code];
  
      const result = await this.db.query(query, values);
      console.log('Query Result:', result.rows);
      return result.rows;
    }
  }
  
