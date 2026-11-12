import { RoleType } from "@prisma/client";
import { getRequestSessionUser } from "@/lib/auth/session";

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN" as RoleType,
  ADMIN: "ADMIN" as RoleType,
  MANAGER: "MANAGER" as RoleType,
  STAFF: "STAFF" as RoleType,
  CUSTOMER: "CUSTOMER" as RoleType,
};

export const ROLE_HIERARCHY: Record<RoleType, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MANAGER: 60,
  STAFF: 40,
  CUSTOMER: 10,
};

export function hasRole(userRole: RoleType | string, allowedRoles: (RoleType | string)[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isStaffOrAdmin(userRole: RoleType | string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"].includes(userRole);
}

export function isAdmin(userRole: RoleType | string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(userRole);
}

export function authorizeAdminRequest(
  sessionRole: string | undefined | null,
  allowedRoles: (RoleType | string)[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]
): { authorized: boolean; error: string | null; status: number } {
  if (!sessionRole) {
    return { authorized: false, error: "Authentication required. Please sign in.", status: 401 };
  }
  if (!allowedRoles.includes(sessionRole)) {
    return { authorized: false, error: "Access denied. Insufficient administrative privileges.", status: 403 };
  }
  return { authorized: true, error: null, status: 200 };
}

export function checkAdminAuth(
  req: Request,
  allowedRoles: (RoleType | string)[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]
): { authorized: boolean; error?: string; status?: number; user?: any } {
  const session = getRequestSessionUser(req);
  if (session && allowedRoles.includes(session.role)) {
    return { authorized: true, user: session };
  }

  return {
    authorized: false,
    error: "Unauthorized: Administrative access required.",
    status: 401,
  };
}
