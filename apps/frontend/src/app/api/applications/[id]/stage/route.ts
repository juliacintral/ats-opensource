import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { stageId } = await req.json()
  const application = await prisma.application.update({
    where: { id: params.id },
    data: { stageId },
    include: { candidate: true, stage: true },
  })
  return NextResponse.json(application)
}
