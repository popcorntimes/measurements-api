// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import { uploadRoutes } from './routes/uploadRoutes';
import { geminiService } from './services/geminiService'; // Certifique-se de que isso é um objeto correto
import { Client } from 'pg';

// Inicializa o aplicativo Express
const app = express();
const port = 3000;

// Função para conectar ao banco de dados com retry
async function connectWithRetry() {
  const client = new Client({
    connectionString: 'postgres://postgres:admin@localhost:5432/measurements'

  });

  let attempts = 0;
  const maxAttempts = 5; // Máximo de tentativas
  const retryDelay = 5000; // 5 segundos de atraso entre tentativas

  while (attempts < maxAttempts) {
    try {
      await client.connect();
      console.log('Database connection established');
      return client; // Retorna o cliente após conexão bem-sucedida
    } catch (err) {
      console.error('Error connecting to database, retrying', err);
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('Maximum attempts reached, exiting process');
        process.exit(1); // Encerra o processo em caso de falha
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay)); // Aguarda antes de tentar novamente
    }
  }
}

// Chame a função de conexão antes de iniciar o servidor
connectWithRetry().then(() => {
  app.use(express.json({ limit: '50mb' })); // Usa express.json() para analisar JSON
  
  // Define as rotas de upload
  app.use('/upload', uploadRoutes(geminiService)); // Uso correto da função uploadRoutes

  // Tratamento de erros de rotas
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Falha ao conectar ao banco de dados:', err);
});
