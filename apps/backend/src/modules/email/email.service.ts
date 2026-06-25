import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST', 'smtp.gmail.com'),
      port: Number(config.get('MAIL_PORT', 587)),
      secure: false,
      auth: {
        user: config.get('MAIL_USER', ''),
        pass: config.get('MAIL_PASS', ''),
      },
    });
  }

  async send(options: MailOptions): Promise<void> {
    const from = this.config.get('MAIL_FROM', 'noreply@ats.local');
    try {
      await this.transporter.sendMail({ from, ...options });
      this.logger.log(`E-mail enviado para: ${options.to}`);
    } catch (err) {
      this.logger.error(`Falha ao enviar e-mail: ${err.message}`);
    }
  }

  async sendInterviewScheduled(to: string, candidateName: string, jobTitle: string, date: Date, meetUrl?: string) {
    return this.send({
      to,
      subject: `Entrevista agendada — ${jobTitle}`,
      html: `
        <h2>Olá, ${candidateName}!</h2>
        <p>Sua entrevista para a vaga <strong>${jobTitle}</strong> foi agendada.</p>
        <p><strong>Data:</strong> ${date.toLocaleString('pt-BR')}</p>
        ${meetUrl ? `<p><a href="${meetUrl}">Entrar na reunião</a></p>` : ''}
        <p>Boa sorte!</p>
      `,
    });
  }

  async sendApplicationReceived(to: string, candidateName: string, jobTitle: string) {
    return this.send({
      to,
      subject: `Candidatura recebida — ${jobTitle}`,
      html: `
        <h2>Olá, ${candidateName}!</h2>
        <p>Recebemos sua candidatura para a vaga <strong>${jobTitle}</strong>.</p>
        <p>Entraremos em contato em breve.</p>
      `,
    });
  }

  async sendStageAdvanced(to: string, candidateName: string, jobTitle: string, stageName: string) {
    return this.send({
      to,
      subject: `Atualização na sua candidatura — ${jobTitle}`,
      html: `
        <h2>Olá, ${candidateName}!</h2>
        <p>Você avançou para a etapa <strong>${stageName}</strong> na vaga <strong>${jobTitle}</strong>.</p>
        <p>Continue acompanhando!</p>
      `,
    });
  }
}
