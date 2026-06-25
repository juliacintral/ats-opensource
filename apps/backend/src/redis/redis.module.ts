import { Module, Global } from '@nestjs/common';

/**
 * RedisModule STUB para MVP sem Redis
 * Quando REDIS_URL não está configurado, usa cache em memória simples
 * Substitua por ioredis real quando quiser adicionar Redis
 */

export const REDIS_CLIENT = 'REDIS_CLIENT';

// Cache em memória simples (substitui Redis no MVP)
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

const inMemoryRedis = {
  async get(key: string): Promise<string | null> {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  },
  async set(key: string, value: string, mode?: string, ttl?: number): Promise<'OK'> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : Date.now() + 86400000;
    memoryCache.set(key, { value, expiresAt });
    return 'OK';
  },
  async del(key: string): Promise<number> {
    memoryCache.delete(key);
    return 1;
  },
  async setex(key: string, ttl: number, value: string): Promise<'OK'> {
    return inMemoryRedis.set(key, value, 'EX', ttl);
  },
};

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
          // MVP sem Redis — usa cache em memória
          console.log('[Redis] Sem REDIS_URL configurado — usando cache em memória (MVP mode)');
          return inMemoryRedis;
        }

        // Com REDIS_URL — usa ioredis real (instala quando precisar)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Redis } = require('ioredis');
        return new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          lazyConnect: true,
          connectTimeout: 5000,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
