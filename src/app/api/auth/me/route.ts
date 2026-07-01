import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: p.userId }, select: { id: true, name: true, email: true, role: true } })
  return user ? NextResponse.json(user) : NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
}
