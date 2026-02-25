import type { Role } from "@/lib/authz";

type Props = {
  role: Role;
  route: string;
  method: string;
  allowed: boolean;
  reason: string;
};

export default function AccessPanel({ role, route, method, allowed, reason }: Props) {
  return (
    <div className={allowed ? "card ok" : "card warn"}>
      <div><strong>권한 체크</strong></div>
      <div>role: <code>{role}</code></div>
      <div>route: <code>{method} {route}</code></div>
      <div>result: <code>{allowed ? "ALLOW" : "DENY"}</code> ({reason})</div>
    </div>
  );
}
