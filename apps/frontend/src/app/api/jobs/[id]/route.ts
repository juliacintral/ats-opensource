import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: 'asc' },
        include: { applications: { include: { candidate: true } } },
      },
    },
  })
  if (!job) return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 })
  return NextResponse.json(job)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const data = await req.json()
  const job = await prisma.job.update({ where: { id: params.id }, data })
  return NextResponse.json(job)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await prisma.job.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
