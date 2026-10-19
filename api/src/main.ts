import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule, ObserveInstrument } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
    bodyParser: false,
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads/',
});
  app.enableCors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
});
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();