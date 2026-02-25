import AccessPanel from "@/components/AccessPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";

type Props = { searchParams: Promise<{ as?: string }> };

export default async function OpsRequestsPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const route = "/ops/requests";
  const permission = requireRouteAccess(role, "GET", route);
  const canWrite = role === "operator" || role === "admin";

  return (
    <main>
      <h1>Ops Requests (SCR-002~006 운영수정)</h1>
      <RoleSwitcher role={role} path={route} />
      <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />
      <div className="card">
        <p>요청 운영 큐 조회 화면입니다. 수정 액션(PATCH)은 operator/admin만 허용됩니다.</p>
        <button style={{ padding: "6px 10px" }} disabled={!canWrite}>
          {canWrite ? "상태 수정 실행(PATCH)" : "조회 전용"}
        </button>
      </div>
    </main>
  );
}
