import { Pool } from 'pg';
import { config } from '../config/config';

export class Database {
  private pool: Pool | null = null;
  private isReconnecting: boolean = false;

  async connect(): Promise<Pool> {
    if (this.pool) {
      return this.pool;
    }

    const pool = new Pool({
      connectionString: config.databaseUrl,
    });

    // Tratar erros de conexão
    pool.on('error', (err) => {
      console.error('Error connecting to database', err);
      
      if (!this.isReconnecting) {
        this.isReconnecting = true;
        console.log('Trying to reconnect to database...');
        setTimeout(async () => {
          try {
            await this.connect();
            console.log('Successful database reconnection!');
            this.isReconnecting = false;
          } catch (reconnectError) {
            console.error('Reconnection failed:', reconnectError);
            console.error('Exiting the application...');
            process.exit(1);
          }
        }, 5000); // Tenta reconectar após 5 segundos
      }


    });

    this.pool = pool;
    return pool;
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}