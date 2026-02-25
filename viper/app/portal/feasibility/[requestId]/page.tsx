import Link from "next/link";
import AccessPanel from "@/components/AccessPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchFeasibilityById, fetchFeasibilityList, fetchRequestById } from "@/lib/mock-api";

type Props = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ as?: string; status?: string; case?: string }>;
};

const STATUS_FILTERS = ["ALL", "LOW", "MEDIUM", "HIGH"] as const;
const CASE_FILTERS = ["base", "relaxed"] as const;

export default async function FeasibilityPage({ params, searchParams }: Props) {
  const { requestId } = await params;
  const query = await searchParams;
  const role = normalizeRole(query.as);
  const status = query.status ?? "ALL";
  const scenarioCase = query.case ?? "base";
  const route = `/portal/feasibility/${requestId}`;
  const permission = requireRouteAccess(role, "GET", route);

  const [request, f, { items: list }] = await Promise.all([
    fetchRequestById(requestId),
    fetchFeasibilityById(requestId),
    fetchFeasibilityList()
  ]);

  const filtered = list.filter((x) => (status === "ALL" ? true : x.success_grade === status));

  return (
    <main>
      <h1>SCR-003 타당성·성공확률</h1>
      <RoleSwitcher role={role} path={`/portal/feasibility/${requestId}`} />
      <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />

      <div className="card">
        <strong>시나리오 토글</strong>
        <div className="row">
          {STATUS_FILTERS.map((s) => (
            <Link key={s} href={`/portal/feasibility/${requestId}?as=${role}&status=${s}&case=${scenarioCase}`} className={status === s ? "pill active" : "pill"}>{s}</Link>
          ))}
        </div>
        <div className="row">
          {CASE_FILTERS.map((c) => (
            <Link key={c} href={`/portal/feasibility/${requestId}?as=${role}&status=${status}&case=${c}`} className={scenarioCase === c ? "pill active" : "pill"}>{c}</Link>
          ))}
        </div>
      </div>

      <div className="card">
        <strong>요청 정보</strong>
        <p><code>{request.id}</code> / {request.name} / {request.sensor}</p>
        <p>기본 윈도우: <code>{f.base_window}</code></p>
        <p>
          성공확률: <StatusBadge text={f.success_grade} />{" "}
          {scenarioCase === "relaxed"
            ? `${Math.round((f.success_probability + f.relaxation.delta_probability) * 100)}% (완화 적용)`
            : `${Math.round(f.success_probability * 100)}% (기본)`}
        </p>
        <p>모델버전: <code>{f.model_version}</code></p>
      </div>

      <div className="grid">
        <div className="card">
          <strong>성공 요인</strong>
          <ul>
            {f.drivers.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
        <div className="card">
          <strong>제약 완화 시뮬레이션</strong>
          <p>cloud: {f.relaxation.cloud_pct_before}% -&gt; {f.relaxation.cloud_pct_after}%</p>
          <p>확률 변화: +{Math.round(f.relaxation.delta_probability * 100)}%p</p>
        </div>
      </div>

      <div className="card">
        <strong>대체 시간창</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr><th align="left">Window</th><th align="left">Grade</th><th align="left">Probability</th></tr>
          </thead>
          <tbody>
            {f.alternatives.map((a) => (
              <tr key={a.window} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{a.window}</td>
                <td><StatusBadge text={a.grade} /></td>
                <td>{Math.round(a.probability * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>요청 필터 결과 ({status})</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr><th align="left">Request</th><th align="left">Grade</th><th align="left">Probability</th><th align="left">Open</th></tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.request_id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{row.request_id}</td>
                <td><StatusBadge text={row.success_grade} /></td>
                <td>{Math.round(row.success_probability * 100)}%</td>
                <td><Link href={`/portal/feasibility/${row.request_id}?as=${role}&status=${status}&case=${scenarioCase}`}>보기</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <Link href={`/portal/quotes/${requestId}?as=${role}`}>SCR-004 견적/승인으로 이동</Link>
      </div>
    </main>
  );
}
