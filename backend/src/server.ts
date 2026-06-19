import { createApp } from './app';
import { env } from './config/env';
import { connectMongo } from './config/mongo';

async function startServer() {
  await connectMongo();
  const app = await createApp();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
