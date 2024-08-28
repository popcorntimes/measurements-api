import express from 'express';
import bodyParser from 'body-parser';
import { uploadRoutes } from './routes/uploadRoutes';
import { uploadController } from './controllers/uploadController';
import { geminiService } from './services/geminiService';

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

app.use('/upload', uploadRoutes(uploadController, geminiService));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});