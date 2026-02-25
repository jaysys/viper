import Link from "next/link";
import AccessPanel from "@/components/AccessPanel";
import MenuPreview from "@/components/MenuPreview";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { getPortalMenu } from "@/lib/menu";
import { fetchDashboard } from "@/lib/mock-api";

type Props = {
  searchParams: Promise<{ as?: string }>;
};

export default async function PortalDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const route = "/portal/dashboard";
  const permission = requireRouteAccess(role, "GET", route);
  const dash = await fetchDashboard(role);

  return (
    <main>
      <h1>SCR-001 Portal Dashboard</h1>
      <RoleSwitcher role={role} path={route} />
      <div className="grid">
        <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />
        <MenuPreview title="Portal 메뉴 미리보기" groups={getPortalMenu(role)} />
      </div>

      <div className="card">
        <strong>역할별 KPI ({dash.role})</strong>
        <div className="grid">
          {dash.kpis.map((k) => (
            <div key={k.key} className="card">
              <div>{k.label}</div>
              <div><b>{k.value}</b></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <strong>역할별 알림</strong>
        <ul>
          {dash.alerts.map((a) => (
            <li key={a.id}><StatusBadge text={a.level} /> {a.message}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <strong>활성 위젯</strong>
        <div className="row">
          {dash.widgets.map((w) => <span className="pill" key={w}>{w}</span>)}
        </div>
      </div>

      <div className="card">
        <strong>Wireframe 빠른 이동</strong>
        <ul>
          <li><Link href={`/portal/requests/new?as=${role}`}>SCR-002 요청 생성</Link></li>
          <li><Link href={`/portal/orders?as=${role}`}>SCR-005 주문 모니터링</Link></li>
          <li><Link href={`/portal/orders/REQ-20260225-002/captures?as=${role}`}>SCR-006 캡처 검수</Link></li>
        </ul>
      </div>
    </main>
  );
}
