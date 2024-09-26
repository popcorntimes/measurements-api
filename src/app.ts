import express from 'express';
import bodyParser from 'body-parser';
import { createUploadRoutes } from './routes/uploadRoutes';
import { createConfirmRoutes } from './routes/confirmRoutes';
import { createListRoutes } from './routes/listRoutes';
import { GeminiServiceImpl } from './services/geminiService';
import { MeasuresServiceImpl } from './services/measuresService';
import { Database } from './database/database';
import { UploadControllerImpl } from './controllers/uploadController';
import { ConfirmControllerImpl } from './controllers/confirmController';
import { ListControllerImpl } from './controllers/listController';

const app = express();
const port = 3000;
const database = new Database();

async function connectWithRetry(database: Database) {
  let attempts = 0;
  const maxAttempts = 5;
  const retryDelay = 5000;

  while (attempts < maxAttempts) {
    try {
      await database.connect();
      console.log('Database connection established');
      return;
    } catch (err) {
      console.error('Error connecting to database, retrying', err);
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('Maximum attempts reached, exiting process');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

connectWithRetry(database).then(async () => {
  const dbPool = await database.connect();

  const geminiService = new GeminiServiceImpl();
  const measuresService = new MeasuresServiceImpl(dbPool);
  const uploadController = new UploadControllerImpl(geminiService, measuresService);
  const confirmController = new ConfirmControllerImpl(measuresService);
  const listController = new ListControllerImpl(measuresService);

  app.use(express.json({ limit: '50mb' }));
  app.use('/measures', createUploadRoutes(uploadController));
  app.use('/customers', createListRoutes(listController));
  app.use('/measures', createConfirmRoutes(confirmController));

  // Tratamento de erros de rotas
  app.use((err: Error, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  // Tratar o encerramento da aplicação
  process.on('SIGINT', async () => {
    await database.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  });
}).catch(err => {
  console.error('Error connecting to database:', err);
});