import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
})

export async function GET(req: NextRequest) {
  const { error } = await withAuth(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  const candidates = await prisma.candidate.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] }
      : undefined,
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(candidates)
}

export async function POST(req: NextRequest) {
  const { error } = await withAuth(req)
  if (error) return error

  try {
    const body = schema.parse(await req.json())
    const candidate = await prisma.candidate.create({ data: body })
    return NextResponse.json(candidate, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
