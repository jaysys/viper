import { redirect } from "next/navigation";
import { canAccessRoute, type Role } from "@/lib/authz";

export function requireRouteAccess(role: Role, method: string, route: string) {
  const permission = canAccessRoute(role, method, route);
  if (!permission.allowed) {
    const qs = new URLSearchParams({ as: role, route, reason: permission.reason });
    redirect(`/forbidden?${qs.toString()}`);
  }
  return permission;
}
