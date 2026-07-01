import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { uploadResume } from '@/lib/storage'
import { getAIProvider } from '@/lib/ai'

export const runtime = 'nodejs'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await withAuth(req)
  if (error) return error
  const { id } = await params

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  // Extract text from PDF
  let resumeText = ''
  try {
    // dynamic import to avoid edge runtime issues
    const pdfParse = (await import('pdf-parse')).default
    const parsed = await pdfParse(buffer)
    resumeText = parsed.text
  } catch {
    resumeText = ''
  }

  // Upload to Supabase Storage
  let resumeUrl = ''
  try {
    resumeUrl = await uploadResume(buffer, file.name)
  } catch {
    // continue without URL if storage not configured
  }

  // Parse with AI
  let resumeJson: Prisma.InputJsonValue = {}
  if (resumeText) {
    try {
      const ai = getAIProvider()
      resumeJson = (await ai.parseResume(resumeText)) as Prisma.InputJsonValue
    } catch {
      // AI unavailable — continue
    }
  }

  const candidate = await prisma.candidate.update({
    where: { id },
    data: { resumeUrl, resumeText, resumeJson },
  })

  return NextResponse.json(candidate)
}
