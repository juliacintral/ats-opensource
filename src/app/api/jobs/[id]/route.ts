import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await withAuth(req)
  if (error) return error
  const { id } = await params

  const job = await prisma.job.findUnique({
    where: { id },
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await withAuth(req)
  if (error) return error
  const { id } = await params

  const body = await req.json()
  const job = await prisma.job.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(job)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await withAuth(req)
  if (error) return error
  const { id } = await params

  await prisma.job.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
