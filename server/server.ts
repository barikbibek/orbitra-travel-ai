import { connectDB } from './src/config/db';
import { env } from './src/config/env';
import app from './src/app';

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

start();