import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export type AppRole = "USER" | "ADMIN";

export const PERMISSION_VALUES = [
  "quotes:create",
  "quotes:read:own",
  "quotes:read:any",
  "admin:quotes:read",
] as const;

export type Permission = (typeof PERMISSION_VALUES)[number];

export type AuthContext = {
  userId: string;
  role: AppRole;
  email?: string;
  fullName?: string;
  permissions: Permission[];
};

const authContextSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]),
  email: z.string().optional(),
  fullName: z.string().optional(),
  permissions: z.array(z.enum(PERMISSION_VALUES)),
});

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  USER: ["quotes:create", "quotes:read:own"],
  ADMIN: ["quotes:read:any", "admin:quotes:read"],
};

export function getPermissionsForRole(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  ctx: AuthContext,
  permission: Permission,
): boolean {
  return ctx.permissions.includes(permission);
}

export function canReadQuote(ctx: AuthContext, ownerId: string): boolean {
  return hasPermission(ctx, "quotes:read:any") || ctx.userId === ownerId;
}

export function getAuthContextFromRequest(
  req: NextRequest,
): AuthContext | null {
  const raw = req.headers.get("x-auth-context");
  if (!raw) return null;
  try {
    return authContextSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="api"' } }
  );
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
