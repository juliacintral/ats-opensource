import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './auth'

export async function withAuth(req: NextRequest) {
  const token =
    req.cookies.get('access_token')?.value ??
    req.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  }

  try {
    const session = await verifyAccessToken(token)
    return { session, error: null }
  } catch {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }), session: null }
  }
}
