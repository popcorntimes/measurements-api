import { Pool } from 'pg';
import { IMeasuresService } from '../interfaces/IMeasuresService';
import { Measure } from '../models/Measure';

export class MeasuresServiceImpl implements IMeasuresService {
  constructor(private db: Pool) {}

  async getMeasuresByCustomer(customer_code: string, measure_type?: string): Promise<Measure[]> {
    const query = `
      SELECT * FROM measures
      WHERE customer_code = $1
      ${measure_type ? 'AND LOWER(measure_type) = LOWER($2)' : ''}
    `;
    const values = measure_type ? [customer_code, measure_type] : [customer_code];
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async getAllMeasuresGroupedByCustomer(): Promise<any[]> {
    const result = await this.db.query('SELECT * FROM measures');

    const groupedMeasures: { [customer_code: string]: Measure[] } = {};
    result.rows.forEach(row => {
      if (!groupedMeasures[row.customer_code]) {
        groupedMeasures[row.customer_code] = [];
      }
      groupedMeasures[row.customer_code].push(row);
    });

    return Object.entries(groupedMeasures).map(([customer_code, measures]) => ({
      customer_code,
      measures,
    }));
  }

  async getMeasureByUuid(measure_uuid: string): Promise<Measure | undefined> {
    const query = 'SELECT * FROM measures WHERE measure_uuid = $1';
    const result = await this.db.query(query, [measure_uuid]);
    return result.rows[0];
  }

  async confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<void> {
    const query = `
      UPDATE measures
      SET has_confirmed = true, measure_value = $1
      WHERE measure_uuid = $2
    `;
    await this.db.query(query, [confirmed_value, measure_uuid]);
  }

  async createMeasure(newMeasure: Measure): Promise<void> {
    try {
      // Verificar se o cliente já existe na tabela customer_measures
      const customerExists = await this.db.query(
        'SELECT 1 FROM customer_measures WHERE customer_code = $1',
        [newMeasure.customer_code]
      );

      // Se o cliente não existir, inserir na tabela customer_measures
      if (customerExists.rows.length === 0) {
        await this.db.query('INSERT INTO customer_measures (customer_code) VALUES ($1)', [newMeasure.customer_code]);
      }

      // Inserir a nova medida na tabela measures
      await this.db.query(
        `INSERT INTO measures (measure_uuid, measure_datetime, measure_type, has_confirmed, image_url, measure_value, customer_code) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newMeasure.measure_uuid,
          newMeasure.measure_datetime,
          newMeasure.measure_type,
          newMeasure.has_confirmed,
          newMeasure.image_url,
          newMeasure.measure_value,
          newMeasure.customer_code,
        ]
      );
    } catch (error) {
      console.error('Error creating measure:', error);
      throw error; // Propagar o erro para a controller
    }
  }

  async findMeasureForCurrentMonth(customer_code: string, measure_datetime: string, measure_type: string): Promise<Measure | undefined> {
    const measureDate = new Date(measure_datetime);
    const currentMonth = measureDate.getMonth();
    const currentYear = measureDate.getFullYear();

    const customer = await this.getMeasuresByCustomer(customer_code);

    if (customer) {
      return customer.find(measure => {
        const existingMeasureDate = new Date(measure.measure_datetime);
        return (
          existingMeasureDate.getMonth() === currentMonth &&
          existingMeasureDate.getFullYear() === currentYear &&
          measure.measure_type.toUpperCase() === measure_type.toUpperCase()
        );
      });
    }
    return undefined;
  }

  
}