import AccessPanel from "@/components/AccessPanel";
import Link from "next/link";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchTemplates } from "@/lib/mock-api";

type Props = {
  searchParams: Promise<{ as?: string; scope?: string }>;
};

export default async function PortalTemplatesPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const scope = params.scope ?? "ALL";
  const route = "/portal/templates";
  const permission = requireRouteAccess(role, "GET", route);
  const { items } = await fetchTemplates(scope);
  const canWrite = role === "requester" || role === "operator" || role === "admin";

  return (
    <main>
      <h1>SCR-007 템플릿</h1>
      <RoleSwitcher role={role} path={route} />
      <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />

      <div className="card">
        <strong>범위 필터</strong>
        <div className="row">
          {["ALL", "PERSONAL", "ORG"].map((s) => (
            <Link key={s} href={`/portal/templates?as=${role}&scope=${s}`} className={scope === s ? "pill active" : "pill"}>
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className="card">
        <strong>템플릿 목록</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">ID</th><th align="left">이름</th><th align="left">범위</th><th align="left">센서</th><th align="left">버전</th><th align="left">상태</th><th align="left">액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.template_id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{t.template_id}</td>
                <td>{t.name}</td>
                <td><StatusBadge text={t.scope} /></td>
                <td>{t.sensor}</td>
                <td>v{t.version}</td>
                <td><StatusBadge text={t.status} /></td>
                <td><button disabled={!canWrite || t.status !== "ACTIVE"} style={{ padding: "6px 10px" }}>{canWrite ? "요청 생성" : "읽기 전용"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>생성/수정 권한: requester/operator/admin (approver는 조회 전용)</p>
      </div>
    </main>
  );
}
