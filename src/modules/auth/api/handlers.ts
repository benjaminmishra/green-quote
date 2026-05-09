import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '../services/authService';
const schema = z.object({ fullName: z.string().min(1), email: z.string().email(), password: z.string().min(6) });
const loginSchema = schema.pick({ email: true, password: true });
export async function registerHandler(req: NextRequest) {
  const data = schema.parse(await req.json());
  const user = await authService.register(data.fullName, data.email, data.password);
  return NextResponse.json({ id: user.id, email: user.email, fullName: user.fullName });
}
export async function loginHandler(req: NextRequest) {
  const data = loginSchema.parse(await req.json());
  const { token, user } = await authService.login(data.email, data.password);
  const res = NextResponse.json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });
  res.cookies.set('token', token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });
  return res;
}
