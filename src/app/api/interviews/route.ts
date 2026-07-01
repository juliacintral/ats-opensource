import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  applicationId: z.string(),
  interviewerId: z.string(),
  scheduledAt: z.string().datetime(),
  meetUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  const { error } = await withAuth(req)
  if (error) return error

  try {
    const body = schema.parse(await req.json())

    const interview = await prisma.interview.create({
      data: {
        applicationId: body.applicationId,
        interviewerId: body.interviewerId,
        scheduledAt: new Date(body.scheduledAt),
        meetUrl: body.meetUrl,
      },
      include: {
        application: { include: { candidate: true, job: true } },
        interviewer: true,
      },
    })

    // Send notification email (best-effort)
    sendEmail({
      to: interview.application.candidate.email,
      subject: `Interview scheduled for ${interview.application.job.title}`,
      html: `<p>Hi ${interview.application.candidate.name},</p>
             <p>Your interview for <strong>${interview.application.job.title}</strong> is scheduled for
             <strong>${new Date(interview.scheduledAt).toLocaleString()}</strong>.</p>
             ${interview.meetUrl ? `<p><a href="${interview.meetUrl}">Join meeting</a></p>` : ''}`,
    }).catch(() => {})

    return NextResponse.json(interview, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
