import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, signAccessToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('refresh_token')?.value
  if (!token) return NextResponse.json({ error: 'No refresh token' }, { status: 401 })

  try {
    const payload = await verifyRefreshToken(token)
    const stored = await prisma.refreshToken.findUnique({ where: { token } })
    if (!stored || stored.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Expired session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const accessToken = await signAccessToken({ sub: user.id, email: user.email, role: user.role })
    const res = NextResponse.json({ ok: true })
    res.cookies.set('access_token', accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 15 })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
