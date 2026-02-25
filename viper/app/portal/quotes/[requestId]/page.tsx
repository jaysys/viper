import Link from "next/link";
import AccessPanel from "@/components/AccessPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { canAccessRoute, normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchQuoteBundle, fetchQuotes, fetchRequestById } from "@/lib/mock-api";

type Props = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ as?: string; status?: string; case?: string }>;
};

const STATUS_FILTERS = ["ALL", "REQUESTED", "APPROVED", "REJECTED"] as const;
const CASE_FILTERS = ["normal", "approver-queue"] as const;

export default async function QuotePage({ params, searchParams }: Props) {
  const { requestId } = await params;
  const query = await searchParams;
  const role = normalizeRole(query.as);
  const status = query.status ?? "ALL";
  const scenarioCase = query.case ?? "normal";

  const viewRoute = `/portal/quotes/${requestId}`;
  const approveRoute = `/portal/quotes/${requestId}/approve`;
  const viewPermission = requireRouteAccess(role, "GET", viewRoute);
  const approvePermission = canAccessRoute(role, "POST", approveRoute);

  const [request, bundle, { items: queueBase }] = await Promise.all([
    fetchRequestById(requestId),
    fetchQuoteBundle(requestId),
    fetchQuotes(status)
  ]);

  const queue = scenarioCase === "approver-queue"
    ? queueBase.filter((q) => q.approval_state === "REQUESTED")
    : queueBase;

  return (
    <main>
      <h1>SCR-004 견적·승인</h1>
      <RoleSwitcher role={role} path={`/portal/quotes/${requestId}`} />
      <AccessPanel role={role} route={viewRoute} method="GET" allowed={viewPermission.allowed} reason={viewPermission.reason} />

      <div className="card">
        <strong>시나리오 토글</strong>
        <div className="row">
          {STATUS_FILTERS.map((s) => (
            <Link key={s} href={`/portal/quotes/${requestId}?as=${role}&status=${s}&case=${scenarioCase}`} className={status === s ? "pill active" : "pill"}>{s}</Link>
          ))}
        </div>
        <div className="row">
          {CASE_FILTERS.map((c) => (
            <Link key={c} href={`/portal/quotes/${requestId}?as=${role}&status=${status}&case=${c}`} className={scenarioCase === c ? "pill active" : "pill"}>{c}</Link>
          ))}
        </div>
      </div>

      <div className="card">
        <strong>요청/견적 요약</strong>
        <p><code>{request.id}</code> / {request.name}</p>
        <p>총액: <code>{bundle.quote.currency} {bundle.quote.total}</code></p>
        <p>구성: base {bundle.quote.base_cost} + sla {bundle.quote.sla_cost} + options {bundle.quote.options_cost}</p>
        <p>승인상태: <StatusBadge text={bundle.quote.approval_state} /></p>
      </div>

      <div className="card">
        <strong>승인 워크플로우 이력</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr><th align="left">Step</th><th align="left">Actor</th><th align="left">At</th><th align="left">Comment</th></tr>
          </thead>
          <tbody>
            {bundle.history.map((h) => (
              <tr key={`${h.step}-${h.at}`} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td><StatusBadge text={h.step} /></td>
                <td>{h.actor}</td>
                <td>{h.at}</td>
                <td>{h.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>승인 액션 시뮬레이션</strong>
        <p>POST 권한 체크: <code>{approvePermission.allowed ? "ALLOW" : `DENY(${approvePermission.reason})`}</code></p>
        <button disabled={!approvePermission.allowed || bundle.quote.approval_state !== "REQUESTED"} style={{ padding: "8px 12px" }}>
          승인 실행(모의)
        </button>
        <p>승인 완료 전 SCR-009 진입은 정책상 차단되어야 함</p>
      </div>

      <div className="card">
        <strong>승인 큐 ({status}, {scenarioCase})</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr><th align="left">Request</th><th align="left">Total</th><th align="left">State</th><th align="left">Open</th></tr>
          </thead>
          <tbody>
            {queue.map((q) => (
              <tr key={q.request_id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{q.request_id}</td>
                <td>{q.currency} {q.total}</td>
                <td><StatusBadge text={q.approval_state} /></td>
                <td><Link href={`/portal/quotes/${q.request_id}?as=${role}&status=${status}&case=${scenarioCase}`}>보기</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
