import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService com suporte a serverless (Vercel/Lambda)
 * Reutiliza a conexão entre invocações warm do mesmo container
 */

// Singleton global para conexão reutilizada entre warm starts
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Reutiliza conexão global em serverless para evitar connection pool exhaustion
    if (process.env.NODE_ENV === 'production') {
      if (!global.__prisma) {
        global.__prisma = this;
      }
      return global.__prisma as this;
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    // Em serverless não desconecta para reusar na próxima invocação
    if (process.env.NODE_ENV !== 'production') {
      await this.$disconnect();
    }
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase não permitido em produção');
    }
    // Ordem respeitando foreign keys
    await this.feedback.deleteMany();
    await this.interview.deleteMany();
    await this.application.deleteMany();
    await this.candidate.deleteMany();
    await this.stage.deleteMany();
    await this.job.deleteMany();
    await this.refreshToken.deleteMany();
    await this.user.deleteMany();
  }
}
