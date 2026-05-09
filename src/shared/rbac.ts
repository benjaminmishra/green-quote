import { NextRequest, NextResponse } from 'next/server';

export type AppRole = 'USER' | 'ADMIN';
export type Permission =
  | 'quotes:create'
  | 'quotes:read:own'
  | 'quotes:read:any'
  | 'admin:quotes:read';

export type AuthContext = {
  userId: string;
  role: AppRole;
  email?: string;
  fullName?: string;
  permissions: Permission[];
};

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  USER: ['quotes:create', 'quotes:read:own'],
  ADMIN: ['quotes:create', 'quotes:read:own', 'quotes:read:any', 'admin:quotes:read']
};

export function getPermissionsForRole(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(ctx: AuthContext, permission: Permission): boolean {
  return ctx.permissions.includes(permission);
}

export function canReadQuote(ctx: AuthContext, ownerId: string): boolean {
  return hasPermission(ctx, 'quotes:read:any') || ctx.userId === ownerId;
}

export function getAuthContextFromRequest(req: NextRequest): AuthContext | null {
  const raw = req.headers.get('x-auth-context');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthContext;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
