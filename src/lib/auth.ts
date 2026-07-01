import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET || 'dev-secret'

export const signToken = (p: { userId: string; email: string; role: string }) =>
  jwt.sign(p, SECRET, { expiresIn: '7d' })

export const verifyToken = (token: string) => {
  try { return jwt.verify(token, SECRET) as { userId: string; email: string; role: string } }
  catch { return null }
}

export const hashPassword = (p: string) => bcrypt.hash(p, 10)
export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h)

export function requireAuth(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  return token ? verifyToken(token) : null
}
