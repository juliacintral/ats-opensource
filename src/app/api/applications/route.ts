import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { z } from 'zod'

const schema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
  stageId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { error } = await withAuth(req)
  if (error) return error

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')
  const candidateId = searchParams.get('candidateId')

  const applications = await prisma.application.findMany({
    where: {
      ...(jobId ? { jobId } : {}),
      ...(candidateId ? { candidateId } : {}),
    },
    include: { candidate: true, job: true, stage: true, feedbacks: true, interviews: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(applications)
}

export async function POST(req: NextRequest) {
  const { error } = await withAuth(req)
  if (error) return error

  try {
    const body = schema.parse(await req.json())

    // Default to first stage of the job
    let stageId = body.stageId
    if (!stageId) {
      const firstStage = await prisma.stage.findFirst({
        where: { jobId: body.jobId },
        orderBy: { order: 'asc' },
      })
      stageId = firstStage?.id
    }

    const application = await prisma.application.create({
      data: { candidateId: body.candidateId, jobId: body.jobId, stageId },
      include: { candidate: true, stage: true },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
