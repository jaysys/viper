import AccessPanel from "@/components/AccessPanel";
import MenuPreview from "@/components/MenuPreview";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { getOpsMenu } from "@/lib/menu";
import { fetchDashboard } from "@/lib/mock-api";

type Props = {
  searchParams: Promise<{ as?: string }>;
};

export default async function OpsDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const route = "/ops/dashboard";
  const permission = requireRouteAccess(role, "GET", route);
  const dash = await fetchDashboard(role);

  return (
    <main>
      <h1>SCR-001 Ops Dashboard</h1>
      <RoleSwitcher role={role} path={route} />
      <div className="grid">
        <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />
        <MenuPreview title="Ops 메뉴 미리보기" groups={getOpsMenu(role)} />
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
    </main>
  );
}
