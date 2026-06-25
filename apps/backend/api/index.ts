/**
 * Vercel Serverless Entrypoint para NestJS
 * Cada request HTTP invoca esta function, que inicializa o app NestJS
 * (cached entre warm invocations na mesma instância)
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      // Desativa logs verbosos no serverless
      logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
    });

    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.setGlobalPrefix('api');

    // Inicializa sem listen — Vercel gerencia o HTTP
    await app.init();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await bootstrap();
  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
}
