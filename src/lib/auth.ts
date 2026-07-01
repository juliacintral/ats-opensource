import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'change-me')
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET ?? 'change-me-refresh')

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signAccessToken(payload: { sub: string; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '15m')
    .sign(JWT_SECRET)
}

export async function signRefreshToken(payload: { sub: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d')
    .sign(REFRESH_SECRET)
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload as { sub: string; email: string; role: string }
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH_SECRET)
  return payload as { sub: string }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return null
  try {
    return await verifyAccessToken(token)
  } catch {
    return null
  }
}

export function requireSession(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * requireAuth — extrai e valida o Bearer token do header Authorization.
 * Retorna o payload decodificado ou null.
 */
export async function requireAuth(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return null
    return await verifyAccessToken(token)
  } catch {
    return null
  }
}

/**
 * withAuth — helper para rotas: retorna { session, error }.
 * Se não autenticado, error é um NextResponse 401 pronto para retornar.
 */
export async function withAuth(req: NextRequest): Promise<
  | { session: { sub: string; email: string; role: string }; error: null }
  | { session: null; error: NextResponse }
> {
  const session = await requireAuth(req)
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) }
  }
  return { session, error: null }
}
