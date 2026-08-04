import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

interface AppOptions {
  // on Vercel the DB connection has to happen lazily inside the request
  // lifecycle rather than once at boot, since there is no long-running
  // process to connect ahead of time — this lets the caller inject that wait
  awaitReady?: () => Promise<unknown>;
}

export function createApp(options: AppOptions = {}) {
  const app = express();

  if (options.awaitReady) {
    app.use((_req, _res, next) => {
      options.awaitReady!().then(() => next(), next);
    });
  }

  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: [env.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' })); // signature payloads arrive as base64
  app.use(express.urlencoded({ extended: true }));

  if (!env.isProd) {
    app.use((req, _res, next) => {
      console.log(`${req.method} ${req.originalUrl}`);
      next();
    });
  }

  app.get('/', (_req, res) => {
    res.json({ service: 'ServiceFlow API', docs: '/api/health' });
  });

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
