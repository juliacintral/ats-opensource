import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  return NextResponse.json(await prisma.interview.findMany({
    include: { application: { include: { candidate: true, job: true } }, interviewer: { select: { id: true, name: true, email: true } } },
    orderBy: { scheduledAt: 'asc' },
  }))
}

export async function POST(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { applicationId, scheduledAt, type, notes } = await req.json()
  return NextResponse.json(await prisma.interview.create({
    data: { applicationId, interviewerId: p.userId, scheduledAt: new Date(scheduledAt), type: type || 'video', notes },
    include: { application: { include: { candidate: true, job: true } } },
  }), { status: 201 })
}
