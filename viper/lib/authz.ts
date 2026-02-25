import matrix from "@/data/authz-matrix.json";

export type Role = "requester" | "operator" | "approver" | "admin";

type RoutePermission = (typeof matrix.route_permissions)[number];
type RoleConfig = {
  description: string;
  default_scopes?: string[];
  inherits?: Role[];
  superuser?: boolean;
};

const VALID_ROLES: Role[] = ["requester", "operator", "approver", "admin"];

export function normalizeRole(input: string | null | undefined): Role {
  if (!input) return "requester";
  return VALID_ROLES.includes(input as Role) ? (input as Role) : "requester";
}

function roleConfig(role: Role) {
  return matrix.roles[role] as RoleConfig;
}

export function getRoleScopes(role: Role): Set<string> {
  const visited = new Set<string>();
  const scopes = new Set<string>();

  function collect(current: Role) {
    if (visited.has(current)) return;
    visited.add(current);

    const cfg = roleConfig(current);
    for (const s of cfg.default_scopes ?? []) scopes.add(s);
    for (const parent of cfg.inherits ?? []) collect(parent as Role);
  }

  collect(role);
  return scopes;
}

function routePatternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withParams = escaped.replace(/:[^/]+/g, "[^/]+");
  return new RegExp(`^${withParams}$`);
}

function findRoutePermission(method: string, route: string): RoutePermission | undefined {
  return matrix.route_permissions.find((rp) => {
    if (rp.method.toUpperCase() !== method.toUpperCase()) return false;
    return routePatternToRegex(rp.route).test(route);
  });
}

export function canAccessRoute(role: Role, method: string, route: string) {
  const rp = findRoutePermission(method, route);
  if (!rp) return { allowed: false, reason: "NO_ROUTE_POLICY" as const };

  const cfg = roleConfig(role);
  if (cfg.superuser) return { allowed: true as const, reason: "SUPERUSER" as const, routePolicy: rp };

  if (!rp.allowed_roles.includes(role)) {
    return { allowed: false as const, reason: "ROLE_BLOCKED" as const, routePolicy: rp };
  }

  const scopes = getRoleScopes(role);
  const hasAllScopes = rp.required_scopes.every((s) => scopes.has(s));
  if (!hasAllScopes) {
    return { allowed: false as const, reason: "SCOPE_MISSING" as const, routePolicy: rp };
  }

  return { allowed: true as const, reason: "OK" as const, routePolicy: rp };
}

export function roleSwitchLinks(path: string): Array<{ role: Role; href: string }> {
  return VALID_ROLES.map((role) => ({ role, href: `${path}?as=${role}` }));
}
