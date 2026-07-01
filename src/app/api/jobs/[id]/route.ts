import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: { stages: { orderBy: { order: 'asc' }, include: { applications: { include: { candidate: true } } } } },
  })
  return job ? NextResponse.json(job) : NextResponse.json({ error: 'Não encontrada' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const data = await req.json()
  return NextResponse.json(await prisma.job.update({ where: { id: params.id }, data }))
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  await prisma.job.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
