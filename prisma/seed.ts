import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ats.com' },
    update: {},
    create: { email: 'admin@ats.com', name: 'Admin', password: hash, role: 'ADMIN' },
  })
  const job = await prisma.job.create({
    data: {
      title: 'Desenvolvedor Full Stack',
      department: 'Engenharia',
      location: 'Remoto',
      description: 'Vaga para desenvolvedor React e Node.js',
      createdById: admin.id,
      stages: {
        create: [
          { name: 'Triagem', order: 1 },
          { name: 'Entrevista RH', order: 2 },
          { name: 'Entrevista Técnica', order: 3 },
          { name: 'Oferta', order: 4 },
        ],
      },
    },
    include: { stages: true },
  })
  const candidate = await prisma.candidate.upsert({
    where: { email: 'joao@exemplo.com' },
    update: {},
    create: { name: 'João Silva', email: 'joao@exemplo.com', phone: '11999999999' },
  })
  await prisma.application.upsert({
    where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
    update: {},
    create: { candidateId: candidate.id, jobId: job.id, stageId: job.stages[0].id },
  })
  console.log('✅ Seed OK! Login: admin@ats.com / admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
