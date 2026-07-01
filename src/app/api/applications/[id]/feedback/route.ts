import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  rating: z.number().min(1).max(5),
  notes: z.string().min(1),
  recommendation: z.enum(['STRONG_YES', 'YES', 'NO', 'STRONG_NO']),
  interviewId: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await withAuth(req)
  if (error) return error

  try {
    const { id } = await params
    const body = schema.parse(await req.json())
    const feedback = await prisma.feedback.create({
      data: {
        applicationId: id,
        authorId: session.sub,
        rating: body.rating,
        notes: body.notes,
        recommendation: body.recommendation,
        interviewId: body.interviewId,
      },
    })
    return NextResponse.json(feedback, { status: 201 })
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
