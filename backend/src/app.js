import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import connectMongo from './db/mongo.js';
import routes from './routes/index.js';
import { startUploadCleanupJob } from './services/uploadCleanup.js';

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env'),
});

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(resolve(process.cwd(), 'uploads')));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  try {
    await connectMongo();
    startUploadCleanupJob();
    app.listen(port, () => {
      console.log(`Backend running on port ${port}`);
    });
  } catch (err) {
    console.error('Server startup failed', err);
    process.exit(1);
  }
};

startServer();
