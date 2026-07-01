import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const jobId = new URL(req.url).searchParams.get('jobId')
  const apps = await prisma.application.findMany({
    where: jobId ? { jobId } : undefined,
    include: { candidate: true, job: true, stage: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(apps)
}

export async function POST(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { candidateId, jobId, stageId } = await req.json()
  try {
    return NextResponse.json(await prisma.application.create({ data: { candidateId, jobId, stageId }, include: { candidate: true, stage: true } }), { status: 201 })
  } catch { return NextResponse.json({ error: 'Candidato já aplicado' }, { status: 409 }) }
}
