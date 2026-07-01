import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await withAuth(req)
  if (error) return error

  const { id } = await params
  const { stageId } = await req.json()
  const app = await prisma.application.update({
    where: { id },
    data: { stageId },
    include: { stage: true },
  })
  return NextResponse.json(app)
}
