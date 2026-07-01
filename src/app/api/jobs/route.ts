import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  stages: z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const { session, error } = await withAuth(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const status = searchParams.get('status')

  const jobs = await prisma.job.findMany({
    where: {
      createdById: session!.sub,
      ...(status ? { status: status as never } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}),
    },
    include: {
      stages: { orderBy: { order: 'asc' } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  const { session, error } = await withAuth(req)
  if (error) return error

  try {
    const body = createSchema.parse(await req.json())
    const defaultStages = body.stages ?? ['Applied', 'Phone Screen', 'Technical', 'Offer']

    const job = await prisma.job.create({
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        salary: body.salary,
        createdById: session!.sub,
        stages: {
          create: defaultStages.map((name, order) => ({ name, order })),
        },
      },
      include: { stages: true },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
