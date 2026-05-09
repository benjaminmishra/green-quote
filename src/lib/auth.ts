import { jwtVerify } from "jose";
import { AppRole, getPermissionsForRole } from "@/shared/rbac";

export type AuthPayload = {
  userId: string;
  role: AppRole;
  email?: string;
  fullName?: string;
  permissions?: string[];
  realm_access?: { roles?: string[] };
};

export async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "change-me",
  );
  const { payload } = await jwtVerify(token, secret);
  const typed = payload as unknown as AuthPayload;

  const kcRoles = typed.realm_access?.roles ?? [];
  const role: AppRole =
    typed.role || (kcRoles.includes("admin") ? "ADMIN" : "USER");
  const permissions = typed.permissions?.length
    ? (typed.permissions as any)
    : getPermissionsForRole(role);

  return {
    userId: typed.userId,
    role,
    email: typed.email,
    fullName: typed.fullName,
    permissions,
  };
}
