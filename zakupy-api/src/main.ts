import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { appOptions, configureApp } from './app.setup.js';
import { env } from './env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, appOptions);
  configureApp(app);
  await app.listen(env.PORT);
}
await bootstrap();
