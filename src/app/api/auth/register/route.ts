import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signAccessToken, signRefreshToken } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json())

    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: await hashPassword(body.password),
      },
    })

    const accessToken = await signAccessToken({ sub: user.id, email: user.email, role: user.role })
    const refreshToken = await signRefreshToken({ sub: user.id })

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
    res.cookies.set('access_token', accessToken, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 15 })
    res.cookies.set('refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    return res
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
