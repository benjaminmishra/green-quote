import { jwtVerify } from "jose";
import { AppRole, getPermissionsForRole, type Permission } from "@/shared/rbac";
import type { AuthPayload } from "@/modules/auth/models/auth";

export async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "change-me",
  );
  const { payload } = await jwtVerify(token, secret);
  const typed = payload as unknown as AuthPayload;

  const kcRoles = typed.realm_access?.roles ?? [];
  const role: AppRole =
    typed.role || (kcRoles.includes("admin") ? "ADMIN" : "USER");
  const permissions: Permission[] = typed.permissions?.length
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
