import type { AppRole, Permission } from "@/shared/rbac";

export type AuthPayload = {
  userId: string;
  role: AppRole;
  email?: string;
  fullName?: string;
  permissions?: Permission[];
  realm_access?: { roles?: string[] };
};
