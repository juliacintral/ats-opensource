import { Module, Global } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * RedisModule com fallback para Upstash (serverless-friendly)
 * Suporta tanto REDIS_URL (ioredis padrão) quanto UPSTASH_REDIS_REST_URL
 */

export const REDIS_CLIENT = 'REDIS_CLIENT';

// Singleton para reutilizar entre warm invocations
declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        if (global.__redis) return global.__redis;

        const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379';

        const client = new Redis(url, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          lazyConnect: true,
          // Configurações recomendadas para serverless
          connectTimeout: 5000,
          commandTimeout: 5000,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 200, 2000);
          },
        });

        client.on('error', (err) => {
          console.error('[Redis] Connection error:', err.message);
        });

        if (process.env.NODE_ENV === 'production') {
          global.__redis = client;
        }

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
