import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password)
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await comparePassword(password, user.password)))
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    const token = signToken({ userId: user.id, email: user.email, role: user.role })
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Erro interno' }, { status: 500 }) }
}
