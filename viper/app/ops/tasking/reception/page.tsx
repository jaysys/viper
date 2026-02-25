import AccessPanel from "@/components/AccessPanel";
import CaptureThumbnail from "@/components/CaptureThumbnail";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchCaptures, fetchReceptionJobs } from "@/lib/mock-api";

type Props = {
  searchParams: Promise<{ as?: string }>;
};

export default async function OpsReceptionPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const route = "/ops/tasking/reception";
  const permission = requireRouteAccess(role, "GET", route);

  const { items: jobs } = await fetchReceptionJobs();
  const canAct = role === "operator" || role === "admin";
  const capturePreview = new Map<
    string,
    { thumbnail_url?: string; full_url?: string; capture_mode?: string; sensor_type?: string; acquired_at?: string }
  >();
  await Promise.all(
    jobs.map(async (job) => {
      const { items } = await fetchCaptures(job.request_id);
      const first = items[0];
      capturePreview.set(job.request_id, {
        thumbnail_url: first?.thumbnail_url,
        full_url: first?.full_url,
        capture_mode: first?.capture_mode,
        sensor_type: first?.sensor_type,
        acquired_at: first?.acquired_at,
      });
    })
  );

  return (
    <main>
      <h1>SCR-010 수신·처리·QA</h1>
      <RoleSwitcher role={role} path={route} />
      <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />
      <div className="card">
        <strong>Reception/QA Monitoring</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">Request</th><th align="left">Image</th><th align="left">Downlink</th><th align="left">Received At</th><th align="left">Checksum</th><th align="left">Pipeline</th><th align="left">QA</th><th align="left">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const canDeliver = job.checksum === "OK" && job.qa === "PASS";
              const preview = capturePreview.get(job.request_id);
              return (
                <tr key={job.request_id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td>{job.request_id}</td>
                  <td>
                    <CaptureThumbnail
                      src={preview?.thumbnail_url}
                      fullUrl={preview?.full_url}
                      alt={`${job.request_id} satellite preview`}
                      captureMode={preview?.capture_mode}
                      sensorType={preview?.sensor_type}
                      acquiredAt={preview?.acquired_at}
                    />
                  </td>
                  <td><StatusBadge text={job.downlink} /></td>
                  <td>{job.downlink_received_at ?? "-"}</td>
                  <td><StatusBadge text={job.checksum} /></td>
                  <td><StatusBadge text={job.pipeline} /></td>
                  <td><StatusBadge text={job.qa} /></td>
                  <td><button disabled={!canDeliver || !canAct} style={{ padding: "6px 10px" }}>{canDeliver && canAct ? "납품 가능" : "차단"}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p>조치 API: <code>POST /ops/tasking/reception/actions</code> / 필수 스코프: <code>ops.reception.write</code></p>
      </div>

      <div className="card">
        <strong>검증 포인트</strong>
        <ul>
          <li>checksum=MISMATCH이면 납품 차단</li>
          <li>QA=FAIL이면 SCR-006 재검토 큐 대상</li>
          <li>Approver는 조회만 가능</li>
        </ul>
      </div>
    </main>
  );
}
