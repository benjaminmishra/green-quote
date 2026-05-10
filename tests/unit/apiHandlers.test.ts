import { describe, it, expect, vi } from 'vitest';
import { postQuoteHandler } from '@/modules/quotes/api/handlers';
import { NextRequest } from 'next/server';

vi.mock('@/shared/rbac', () => ({
  getAuthContextFromRequest: vi.fn().mockReturnValue({ userId: 'u1', role: 'USER', permissions: ['quotes:create'] }),
  hasPermission: vi.fn().mockReturnValue(true),
}));

vi.mock('@/modules/quotes/repositories/quotesRepository', () => ({
  quotesRepository: {
    create: vi.fn().mockResolvedValue({ id: 'quote1' }),
  }
}));

describe('Quote Handlers', () => {
  it('postQuoteHandler returns 400 for invalid data', async () => {
    const req = new NextRequest('http://localhost/api/quotes', {
      method: 'POST',
      body: JSON.stringify({ systemSizeKw: -5 }) // invalid size
    });
    
    const res = await postQuoteHandler(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('postQuoteHandler returns 200 for valid data', async () => {
    const req = new NextRequest('http://localhost/api/quotes', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@test.com',
        address: '123 Fake St',
        monthlyConsumptionKwh: 1000,
        systemSizeKw: 5,
        downPayment: 1000,
      })
    });
    
    const res = await postQuoteHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('quote1');
    expect(json.offers.length).toBeGreaterThan(0);
  });
});
