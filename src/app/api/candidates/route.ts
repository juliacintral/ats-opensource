import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const search = new URL(req.url).searchParams.get('search') || ''
  const candidates = await prisma.candidate.findMany({
    where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : undefined,
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(candidates)
}

export async function POST(req: NextRequest) {
  const p = requireAuth(req)
  if (!p) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { name, email, phone } = await req.json()
  if (!name || !email) return NextResponse.json({ error: 'Nome e email obrigatórios' }, { status: 400 })
  try {
    return NextResponse.json(await prisma.candidate.create({ data: { name, email, phone } }), { status: 201 })
  } catch { return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 }) }
}
