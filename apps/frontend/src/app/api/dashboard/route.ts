import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const payload = requireAuth(req)
  if (!payload) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [totalJobs, openJobs, totalCandidates, totalApplications, recentJobs] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: 'OPEN' } }),
    prisma.candidate.count(),
    prisma.application.count(),
    prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    }),
  ])

  return NextResponse.json({ totalJobs, openJobs, totalCandidates, totalApplications, recentJobs })
}
