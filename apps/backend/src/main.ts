import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug'] });

  // Prefix global de todas as rotas
  app.setGlobalPrefix('api');

  // CORS — aceita frontend local e URL configurada em variável de ambiente
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validação global: transforma tipos, whitelist de campos, bloqueia extras
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ATS Open Source API')
    .setDescription(
      'API do ATS enterprise self-hosted.\n\n' +
      '**Stack:** NestJS · PostgreSQL · Prisma · Redis · Ollama\n\n' +
      '**Auth:** JWT Bearer — faça login em `POST /api/auth/login` para obter o token, clique em **Authorize** e cole `Bearer <token>`.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Login, registro e refresh de token')
    .addTag('Users', 'Gerenciamento de usuários internos')
    .addTag('Jobs', 'Vagas e pipeline de estágios')
    .addTag('Candidates', 'Candidatos, currículo e busca FTS')
    .addTag('Applications', 'Candidaturas e kanban de estágios')
    .addTag('Interviews', 'Entrevistas, agenda e scorecard')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'ATS Open Source · Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  logger.log(`🚀 Backend rodando em: http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs em:    http://localhost:${port}/docs`);
}

bootstrap();
