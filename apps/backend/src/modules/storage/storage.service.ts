import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * StorageService — upload de currículos.
 * Provedor padrão: Supabase Storage (gratuito).
 * Para MinIO self-hosted, substitua a implementação de uploadFile.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null = null;
  private bucket: string;

  constructor(private config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL');
    const key = config.get<string>('SUPABASE_KEY');
    this.bucket = config.get<string>('SUPABASE_BUCKET', 'resumes');
    if (url && key) {
      this.supabase = createClient(url, key);
    } else {
      this.logger.warn('Supabase não configurado — uploads ficam em memória apenas');
    }
  }

  async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    if (!this.supabase) {
      this.logger.warn(`StorageService: sem provedor configurado. Arquivo ${filename} não persistido.`);
      return '';
    }
    const path = `resumes/${Date.now()}-${filename}`;
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Upload falhou: ${error.message}`);

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
