import AccessPanel from "@/components/AccessPanel";
import CaptureThumbnail from "@/components/CaptureThumbnail";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchCaptures } from "@/lib/mock-api";

type Props = {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<{ as?: string }>;
};

export default async function CaptureReviewPage({ params, searchParams }: Props) {
  const { requestId } = await params;
  const query = await searchParams;
  const role = normalizeRole(query.as);
  const route = `/portal/orders/${requestId}/captures`;
  const permission = requireRouteAccess(role, "GET", route);
  const { items: captureList } = await fetchCaptures(requestId);
  const canReview = role === "operator" || role === "admin";

  return (
    <main>
      <h1>SCR-006 요청 상세·캡처 검수</h1>
      <RoleSwitcher role={role} path={`/portal/orders/${requestId}/captures`} />
      <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />

      <div className="card">
        <strong>Request ID: {requestId}</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">Capture</th><th align="left">Image</th><th align="left">Quality</th><th align="left">Cloud%</th><th align="left">Resolution(m)</th><th align="left">Delivery</th><th align="left">Reject Code</th><th align="left">Trace</th><th align="left">Action</th>
            </tr>
          </thead>
          <tbody>
            {captureList.map((c) => (
              <tr key={c.capture_id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{c.capture_id}</td>
                <td>
                  <CaptureThumbnail
                    src={c.thumbnail_url}
                    fullUrl={c.full_url}
                    alt={`${c.capture_id} satellite capture`}
                    captureMode={c.capture_mode}
                    sensorType={c.sensor_type}
                    acquiredAt={c.acquired_at}
                  />
                </td>
                <td><StatusBadge text={c.quality} /></td>
                <td>{c.cloud_pct}</td>
                <td>{c.resolution_m}</td>
                <td><StatusBadge text={c.delivery} /></td>
                <td>{c.reject_reason_code ?? "-"}</td>
                <td><code>{c.trace_id}</code></td>
                <td>
                  <button disabled={!canReview} style={{ padding: "6px 10px" }}>
                    {canReview ? "검수 저장" : "조회 전용"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>검증 포인트</strong>
        <ul>
          <li>FAIL/CONDITIONAL 케이스는 `reject_reason_code` 필수</li>
          <li>재촬영/재검토 요청은 `trace_id`로 원 요청 연결</li>
          <li>샘플 위성 이미지는 공개 라이선스 출처 링크를 사용</li>
          <li>Requester 역할은 조회 전용</li>
        </ul>
      </div>
    </main>
  );
}
