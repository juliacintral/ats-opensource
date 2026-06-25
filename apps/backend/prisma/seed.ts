import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hash = await bcrypt.hash('Admin@12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ats.local' },
    update: {},
    create: {
      name: 'Admin ATS',
      email: 'admin@ats.local',
      password: hash,
      role: 'ADMIN',
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@ats.local' },
    update: {},
    create: {
      name: 'Ana Recruiter',
      email: 'recruiter@ats.local',
      password: await bcrypt.hash('Recruiter@12345', 10),
      role: 'RECRUITER',
    },
  });

  const job = await prisma.job.upsert({
    where: { id: 'seed-job-001' },
    update: {},
    create: {
      id: 'seed-job-001',
      title: 'Engenheiro(a) de Software Sênior',
      department: 'Tecnologia',
      location: 'São Paulo, SP',
      isRemote: true,
      status: 'OPEN',
      salaryMin: 10000,
      salaryMax: 16000,
      salaryCurrency: 'BRL',
      description: 'Vaga de exemplo criada pelo seed para testes E2E.',
      recruiterId: recruiter.id,
      pipeline: {
        create: [
          { name: 'Triagem', order: 1 },
          { name: 'Entrevista RH', order: 2 },
          { name: 'Entrevista Técnica', order: 3 },
          { name: 'Proposta', order: 4 },
        ],
      },
    },
  });

  const candidate = await prisma.candidate.upsert({
    where: { email: 'candidato@ats.local' },
    update: {},
    create: {
      name: 'Carlos Candidato',
      email: 'candidato@ats.local',
      phone: '+55 11 91234-5678',
      location: 'São Paulo, SP',
      source: 'MANUAL',
      skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL'],
      aiSummary: 'Desenvolvedor full stack com 5 anos de experiência em TypeScript e Node.js.',
    },
  });

  console.log('✅ Seed concluído:', { admin: admin.email, recruiter: recruiter.email, job: job.title, candidate: candidate.name });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
