import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')

  const applications = await prisma.application.findMany({
    where: jobId ? { jobId } : undefined,
    include: { candidate: true, job: true, stage: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(applications)
}

export async function POST(req: NextRequest) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { candidateId, jobId, stageId } = await req.json()
  try {
    const application = await prisma.application.create({
      data: { candidateId, jobId, stageId },
      include: { candidate: true, stage: true },
    })
    return NextResponse.json(application, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Candidato já aplicado nesta vaga' }, { status: 409 })
  }
}
