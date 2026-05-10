import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { registerHandler, loginHandler } from '@/modules/auth/api/handlers';
import { prisma } from '@/shared/db';

describe('Auth Flow Integration', () => {
  beforeAll(async () => {
    // Clear users before running tests
    await prisma.user.deleteMany({});
  });

  it('can register a new user, login, and receive a token', async () => {
    // 1. Register
    const regReq = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName: 'Flow Test', email: 'flow@test.com', password: 'password123' })
    });
    
    const regRes = await registerHandler(regReq);
    expect(regRes.status).toBe(200);
    const regData = await regRes.json();
    expect(regData.email).toBe('flow@test.com');

    // 2. Login
    const loginReq = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'flow@test.com', password: 'password123' })
    });

    const loginRes = await loginHandler(loginReq);
    expect(loginRes.status).toBe(200);
    
    // Check if cookie is set
    const cookies = loginRes.cookies.get('token');
    expect(cookies).toBeDefined();
    expect(cookies?.value).not.toBe('');
  });
});
