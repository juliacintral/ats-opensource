import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const jobs = await prisma.job.findMany({
    include: { _count: { select: { applications: true } }, stages: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { title, department, location, description } = await req.json()
  if (!title) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 })
  const job = await prisma.job.create({
    data: {
      title, department, location, description, createdById: p.userId,
      stages: { create: [{ name: 'Triagem', order: 1 }, { name: 'Entrevista RH', order: 2 }, { name: 'Entrevista Técnica', order: 3 }, { name: 'Oferta', order: 4 }] },
    },
    include: { stages: true },
  })
  return NextResponse.json(job, { status: 201 })
}
