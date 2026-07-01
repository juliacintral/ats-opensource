import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const { session, error } = await withAuth(req)
  if (error) return error

  const [totalJobs, openJobs, totalCandidates, totalApplications, recentApplications] = await Promise.all([
    prisma.job.count({ where: { createdById: session!.sub } }),
    prisma.job.count({ where: { createdById: session!.sub, status: 'OPEN' } }),
    prisma.candidate.count(),
    prisma.application.count(),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { candidate: true, job: true, stage: true },
    }),
  ])

  return NextResponse.json({
    totalJobs,
    openJobs,
    totalCandidates,
    totalApplications,
    recentApplications,
  })
}
