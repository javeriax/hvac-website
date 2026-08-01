import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { cloudinaryConfigured } from './config/cloudinary';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[api] ServiceFlow API listening on http://localhost:${env.port}`);
    console.log(`[api] cloudinary: ${cloudinaryConfigured ? 'enabled' : 'disabled (local fallback)'}`);
  });
}

bootstrap().catch((err) => {
  console.error('[fatal] failed to start server:', err);
  process.exit(1);
});
