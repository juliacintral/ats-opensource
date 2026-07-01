import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const p = await requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const { stageId } = await req.json()
  return NextResponse.json(
    await prisma.application.update({
      where: { id },
      data: { stageId },
      include: { candidate: true, stage: true },
    })
  )
}
