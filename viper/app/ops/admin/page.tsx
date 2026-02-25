import AccessPanel from "@/components/AccessPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchAdminConfig } from "@/lib/mock-api";

type Props = {
  searchParams: Promise<{ as?: string }>;
};

export default async function OpsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const route = "/ops/admin";
  const permission = requireRouteAccess(role, "GET", route);
  const cfg = await fetchAdminConfig();

  return (
    <main>
      <h1>SCR-008 관리자 설정</h1>
      <RoleSwitcher role={role} path={route} />
      <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />

      <div className="card">
        <strong>정책 설정</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">정책키</th><th align="left">값</th><th align="left">수정자</th><th align="left">수정시각</th>
            </tr>
          </thead>
          <tbody>
            {cfg.policies.map((p) => (
              <tr key={p.key} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{p.key}</td>
                <td><code>{String(p.value)}</code></td>
                <td>{p.updated_by}</td>
                <td>{p.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>계약/쿼터</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">조직</th><th align="left">월 한도</th><th align="left">사용량</th><th align="left">잔여 크레딧</th>
            </tr>
          </thead>
          <tbody>
            {cfg.quotas.map((q) => (
              <tr key={q.org} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{q.org}</td>
                <td>{q.monthly_task_limit}</td>
                <td>{q.used}</td>
                <td>{q.credit_balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>감사로그</strong>
        <ul>
          {cfg.audit_logs.map((x) => (
            <li key={x.id}><StatusBadge text={x.result} /> {x.at} / {x.actor} / {x.action} / {x.target}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
