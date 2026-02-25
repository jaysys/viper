import Link from "next/link";
import AccessPanel from "@/components/AccessPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchQuotes, fetchRequests, fetchTimeline } from "@/lib/mock-api";

type Props = {
  searchParams: Promise<{ as?: string; status?: string }>;
};

const FILTERS = ["ALL", "Approved", "Tasked", "Failed"];

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const status = params.status ?? "ALL";
  const route = "/portal/orders";
  const permission = requireRouteAccess(role, "GET", route);

  const [{ items: requests }, { items: quotes }] = await Promise.all([fetchRequests(status), fetchQuotes("ALL")]);
  const timelineMap = new Map<string, string[]>();
  await Promise.all(
    requests.map(async (r) => {
      const t = await fetchTimeline(r.id);
      timelineMap.set(r.id, t.items);
    })
  );

  return (
    <main>
      <h1>SCR-005 주문/작전 모니터링</h1>
      <RoleSwitcher role={role} path={route} />
      <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />

      <div className="card">
        <strong>상태 필터</strong>
        <div className="row">
          {FILTERS.map((f) => (
            <Link key={f} href={`/portal/orders?as=${role}&status=${f}`} className={status === f ? "pill active" : "pill"}>{f}</Link>
          ))}
        </div>
      </div>

      <div className="card">
        <strong>요청 목록</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">ID</th><th align="left">요청명</th><th align="left">우선순위</th><th align="left">상태</th><th align="left">견적</th><th align="left">타임라인</th><th align="left">상세</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const q = quotes.find((x) => x.request_id === r.id);
              const timeline = timelineMap.get(r.id) ?? [];
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td><StatusBadge text={r.priority} /></td>
                  <td><StatusBadge text={r.status} /></td>
                  <td>{q ? `${q.currency} ${q.total}` : "-"}</td>
                  <td><code>{timeline[timeline.length - 1] ?? "-"}</code></td>
                  <td>
                    <Link href={`/portal/feasibility/${r.id}?as=${role}`}>SCR-003</Link>{" "}
                    <Link href={`/portal/quotes/${r.id}?as=${role}`}>SCR-004</Link>{" "}
                    <Link href={`/portal/orders/${r.id}/captures?as=${role}`}>SCR-006</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>시나리오 확인</strong>
        <ul>
          <li>정상: `REQ-20260225-002` (Delivered/Completed)</li>
          <li>진행중: `REQ-20260225-001` (Tasked)</li>
          <li>실패: `REQ-20260225-003` (Failed)</li>
        </ul>
      </div>
    </main>
  );
}
