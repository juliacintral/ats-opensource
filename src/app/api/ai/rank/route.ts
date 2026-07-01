import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { getAIProvider } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { error } = await withAuth(req)
  if (error) return error

  const { jobId } = await req.json()

  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const applications = await prisma.application.findMany({
    where: { jobId, status: 'ACTIVE' },
    include: { candidate: true },
  })

  if (!applications.length) return NextResponse.json([])

  const ai = getAIProvider()
  const jobDesc = `${job.title}\n${job.description ?? ''}`
  const cvs = applications.map(a => a.candidate.resumeText ?? a.candidate.name)

  const scores = await ai.rankCandidates(jobDesc, cvs)

  // Persist scores
  await Promise.all(
    applications.map((app, i) =>
      prisma.application.update({
        where: { id: app.id },
        data: { aiScore: scores[i] },
      })
    )
  )

  return NextResponse.json(
    applications.map((app, i) => ({ applicationId: app.id, candidateName: app.candidate.name, score: scores[i] }))
  )
}
