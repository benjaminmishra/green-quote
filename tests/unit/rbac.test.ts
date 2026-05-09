import { describe, it, expect } from 'vitest';
import { canReadQuote, getPermissionsForRole, hasPermission } from '@/shared/rbac';

describe('rbac', () => {
  it('user has own quote permissions only', () => {
    const permissions = getPermissionsForRole('USER');
    expect(permissions).toContain('quotes:read:own');
    expect(permissions).not.toContain('quotes:read:any');
  });

  it('admin has any-read permission', () => {
    const permissions = getPermissionsForRole('ADMIN');
    expect(permissions).toContain('quotes:read:any');
  });

  it('owner can read own quote', () => {
    const ctx = { userId: 'u1', role: 'USER' as const, permissions: getPermissionsForRole('USER') };
    expect(canReadQuote(ctx, 'u1')).toBe(true);
    expect(canReadQuote(ctx, 'u2')).toBe(false);
  });

  it('admin permission checks', () => {
    const ctx = { userId: 'a1', role: 'ADMIN' as const, permissions: getPermissionsForRole('ADMIN') };
    expect(hasPermission(ctx, 'admin:quotes:read')).toBe(true);
  });
});
