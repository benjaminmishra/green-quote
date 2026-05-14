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

/**
 * Gets the permissions for a specific role.
 * @param role The role to get permissions for.
 * @returns An array of permissions for the specified role.
 */
export function getPermissionsForRole(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Checks if the authenticated user has a specific permission.
 * @param ctx The authentication context.
 * @param permission The permission to check.
 * @returns True if the user has the permission, false otherwise.
 */
export function hasPermission(
  ctx: AuthContext,
  permission: Permission,
): boolean {
  return ctx.permissions.includes(permission);
}

/**
 * Checks if the authenticated user can read a quote.
 * @param ctx The authentication context.
 * @param ownerId The ID of the quote owner.
 * @returns True if the user can read the quote, false otherwise.
 */
export function canReadQuote(ctx: AuthContext, ownerId: string): boolean {
  return hasPermission(ctx, "quotes:read:any") || ctx.userId === ownerId;
}

/**
 * Extracts authentication context from request headers.
 * @param req The incoming request.
 * @returns The authentication context or null if not present or invalid.
 */
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

/**
 * Returns an unauthorized response.
 * @returns The unauthorized response.
 */
export function unauthorized() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="api"' } }
  );
}

/**
 * Returns a forbidden response.
 * @returns The forbidden response.
 */
export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
