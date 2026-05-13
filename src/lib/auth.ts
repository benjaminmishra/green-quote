import { jwtVerify } from "jose";
import { z } from "zod";
import { AppRole, getPermissionsForRole, PERMISSION_VALUES } from "@/shared/rbac";

const payloadSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  email: z.string().optional(),
  fullName: z.string().optional(),
  permissions: z.array(z.enum(PERMISSION_VALUES)).optional(),
  realm_access: z.object({ roles: z.array(z.string()).optional() }).optional(),
});

export async function verifyToken(token: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  const typed = payloadSchema.parse(payload);

  const kcRoles = typed.realm_access?.roles ?? [];
  const role: AppRole =
    typed.role || (kcRoles.includes("admin") ? "ADMIN" : "USER");
  const permissions = typed.permissions?.length
    ? typed.permissions
    : getPermissionsForRole(role);

  return {
    userId: typed.userId,
    role,
    email: typed.email,
    fullName: typed.fullName,
    permissions,
  };
}
