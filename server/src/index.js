import { createServer } from 'http';
import app from './app.js';
import { loadEnv } from './config/env.js';
import { connectMongo } from './config/mongo.js';

async function start() {
  const env = loadEnv();
  await connectMongo(env.MONGODB_URI);
  const server = createServer(app);
  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error', err);
  process.exit(1);
});


