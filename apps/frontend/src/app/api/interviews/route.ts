import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const interviews = await prisma.interview.findMany({
    include: {
      application: { include: { candidate: true, job: true } },
      interviewer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  return NextResponse.json(interviews)
}

export async function POST(req: NextRequest) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { applicationId, scheduledAt, type, notes } = await req.json()
  const interview = await prisma.interview.create({
    data: {
      applicationId,
      interviewerId: payload.userId,
      scheduledAt: new Date(scheduledAt),
      type: type || 'video',
      notes,
    },
    include: { application: { include: { candidate: true, job: true } } },
  })
  return NextResponse.json(interview, { status: 201 })
}
