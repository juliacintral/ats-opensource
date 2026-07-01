import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await withAuth(req)
  if (error) return error

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      stages: { orderBy: { order: 'asc' } },
      applications: {
        include: { candidate: true, stage: true, feedbacks: true },
      },
    },
  })

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(job)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await withAuth(req)
  if (error) return error

  const body = await req.json()
  const job = await prisma.job.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(job)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await withAuth(req)
  if (error) return error

  await prisma.job.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
