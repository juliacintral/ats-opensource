import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Criando dados iniciais...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ats.com' },
    update: {},
    create: { email: 'admin@ats.com', password: adminPassword, name: 'Admin', role: 'ADMIN' },
  });

  const recruiterPassword = await bcrypt.hash('recruiter123', 10);
  await prisma.user.upsert({
    where: { email: 'recruiter@ats.com' },
    update: {},
    create: { email: 'recruiter@ats.com', password: recruiterPassword, name: 'Recrutador', role: 'RECRUITER' },
  });

  await prisma.job.create({
    data: {
      title: 'Desenvolvedor Full Stack',
      description: 'Vaga para desenvolvedor com experiencia em React e Node.js',
      department: 'Tecnologia',
      location: 'Remoto',
      status: 'OPEN',
      stages: {
        create: [
          { name: 'Triagem', order: 0, color: '#6366f1' },
          { name: 'Entrevista RH', order: 1, color: '#f59e0b' },
          { name: 'Entrevista Tecnica', order: 2, color: '#3b82f6' },
          { name: 'Oferta', order: 3, color: '#10b981' },
        ],
      },
    },
  });

  await prisma.candidate.upsert({
    where: { email: 'candidato@email.com' },
    update: {},
    create: {
      name: 'Joao Silva',
      email: 'candidato@email.com',
      phone: '11999999999',
      skills: ['React', 'Node.js', 'TypeScript'],
    },
  });

  console.log('Seed concluido!');
  console.log('admin@ats.com / admin123');
  console.log('recruiter@ats.com / recruiter123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
