import Link from "next/link";
import AccessPanel from "@/components/AccessPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchQuotes, fetchRequests, fetchSatellites, fetchUplinkAllocationTests, fetchUplinkJobs } from "@/lib/mock-api";

type Props = {
  searchParams: Promise<{ as?: string; request?: string; satellite?: string; at?: string }>;
};

export default async function OpsUplinkPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const route = "/ops/tasking/uplink";
  const permission = requireRouteAccess(role, "GET", route);

  const [{ items: jobs }, { items: quotes }, { items: requests }, { items: satellites }, { items: allocTests }] = await Promise.all([
    fetchUplinkJobs(),
    fetchQuotes("ALL"),
    fetchRequests("ALL"),
    fetchSatellites(),
    fetchUplinkAllocationTests(),
  ]);
  const canExecute = role === "operator" || role === "admin";
  const quoteMap = new Map(quotes.map((x) => [x.request_id, x]));
  const reqMap = new Map(requests.map((x) => [x.id, x]));
  const satMap = new Map(satellites.map((x) => [x.satellite_id, x]));
  const selectedRequestId = params.request ?? requests[0]?.id;
  const selectedSatelliteId = params.satellite ?? satellites[0]?.satellite_id;
  const selectedAt = params.at ?? jobs.find((x) => x.request_id === selectedRequestId)?.scheduled_at ?? "";

  const inContactWindow = (satelliteId: string, at: string | undefined) => {
    const sat = satMap.get(satelliteId);
    if (!sat || !at) return false;
    const t = Date.parse(at);
    return sat.contact_windows.some((w) => t >= Date.parse(w.start) && t <= Date.parse(w.end));
  };

  const getBlockReason = (job: (typeof jobs)[number]) => {
    if (!canExecute) return "권한 부족";
    const q = quoteMap.get(job.request_id);
    if (q?.approval_state !== "APPROVED") return "미승인 견적";
    const req = reqMap.get(job.request_id);
    const sat = satMap.get(job.satellite_id);
    if (!sat) return "위성 미등록";
    if (sat.status !== "AVAILABLE") return `위성 상태 ${sat.status}`;
    if (req && !sat.sensors.includes(req.sensor)) return "센서 불일치";
    if (sat.assigned_today >= sat.daily_capacity) return "일일 용량 초과";
    if (!inContactWindow(job.satellite_id, job.scheduled_at)) return "연락창 미도달";
    return null;
  };
  const getBlockReasonByInput = (requestId: string | undefined, satelliteId: string | undefined, at: string | undefined) => {
    if (!requestId || !satelliteId) return "입력 부족";
    if (!canExecute) return "권한 부족";
    const q = quoteMap.get(requestId);
    if (q?.approval_state !== "APPROVED") return "미승인 견적";
    const req = reqMap.get(requestId);
    const sat = satMap.get(satelliteId);
    if (!sat) return "위성 미등록";
    if (sat.status !== "AVAILABLE") return `위성 상태 ${sat.status}`;
    if (req && !sat.sensors.includes(req.sensor)) return "센서 불일치";
    if (sat.assigned_today >= sat.daily_capacity) return "일일 용량 초과";
    if (!inContactWindow(satelliteId, at)) return "연락창 미도달";
    return null;
  };
  const simBlockReason = getBlockReasonByInput(selectedRequestId, selectedSatelliteId, selectedAt);

  return (
    <main>
      <h1>SCR-009 작전지시(Uplink)</h1>
      <RoleSwitcher role={role} path={route} />
      <AccessPanel role={role} route={route} method="GET" allowed={permission.allowed} reason={permission.reason} />
      <div className="card">
        <strong>Uplink Queue</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">Job</th><th align="left">Request</th><th align="left">Satellite</th><th align="left">Operator</th><th align="left">Status</th><th align="left">Response</th><th align="left">Attempts</th><th align="left">Execute</th><th align="left">Scheduled</th><th align="left">Block Reason</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const blockReason = getBlockReason(job);
              const blocked = Boolean(blockReason);
              return (
                <tr key={job.job_id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td>{job.job_id}</td>
                  <td>{job.request_id}</td>
                  <td>{job.satellite_id}</td>
                  <td>{job.operator}</td>
                  <td><StatusBadge text={job.status} /></td>
                  <td>{job.response_code ?? "-"}</td>
                  <td>{job.attempts}</td>
                  <td><button disabled={blocked} style={{ padding: "6px 10px" }}>{blocked ? "차단" : "지시 실행"}</button></td>
                  <td>{job.scheduled_at ?? "-"}</td>
                  <td>{blockReason ?? "실행 가능"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p>실행 API: <code>POST /ops/tasking/uplink/execute</code> / 필수 스코프: <code>ops.uplink.execute</code></p>
      </div>

      <div className="card">
        <strong>Satellite Fleet (N={satellites.length})</strong>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">Satellite</th><th align="left">Sensors</th><th align="left">Status</th><th align="left">Health</th><th align="left">Capacity</th><th align="left">Next Window</th>
            </tr>
          </thead>
          <tbody>
            {satellites.map((sat) => (
              <tr key={sat.satellite_id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{sat.satellite_id}</td>
                <td>{sat.sensors.join(", ")}</td>
                <td><StatusBadge text={sat.status} /></td>
                <td>{sat.health_score}</td>
                <td>{sat.assigned_today}/{sat.daily_capacity}</td>
                <td>{sat.contact_windows[0]?.start ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>운영자 재할당 시뮬레이터</strong>
        <p>
          Request: <code>{selectedRequestId}</code> / Satellite: <code>{selectedSatelliteId}</code> / At: <code>{selectedAt || "-"}</code>
        </p>
        <p>결과: {simBlockReason ? <StatusBadge text={`DENY: ${simBlockReason}`} /> : <StatusBadge text="ALLOW" />}</p>
        <div style={{ marginTop: 8 }}>
          <strong>요청 선택</strong>
          <div className="row">
            {requests.map((r) => (
              <Link
                key={r.id}
                href={`/ops/tasking/uplink?as=${role}&request=${r.id}&satellite=${selectedSatelliteId ?? ""}&at=${encodeURIComponent(selectedAt)}`}
                className={r.id === selectedRequestId ? "pill active" : "pill"}
              >
                {r.id}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>위성 선택</strong>
          <div className="row">
            {satellites.map((sat) => (
              <Link
                key={sat.satellite_id}
                href={`/ops/tasking/uplink?as=${role}&request=${selectedRequestId ?? ""}&satellite=${sat.satellite_id}&at=${encodeURIComponent(selectedAt)}`}
                className={sat.satellite_id === selectedSatelliteId ? "pill active" : "pill"}
              >
                {sat.satellite_id}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>시각 선택</strong>
          <div className="row">
            {(satMap.get(selectedSatelliteId ?? "")?.contact_windows ?? []).map((w) => (
              <Link
                key={w.start}
                href={`/ops/tasking/uplink?as=${role}&request=${selectedRequestId ?? ""}&satellite=${selectedSatelliteId ?? ""}&at=${encodeURIComponent(w.start)}`}
                className={w.start === selectedAt ? "pill active" : "pill"}
              >
                {w.start}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <strong>Uplink Allocation Validation Cases</strong>
        <p>정상/비정상 케이스: {allocTests.length}건</p>
        <ul>
          <li>ALLOW: {allocTests.filter((x) => x.expected === "ALLOW").length}건</li>
          <li>DENY: {allocTests.filter((x) => x.expected === "DENY").length}건</li>
        </ul>
      </div>

      <div className="card">
        <strong>검증 포인트</strong>
        <ul>
          <li>승인(Approved) 이전 요청은 실행 버튼 차단</li>
          <li>위성 상태/센서/연락창/용량 조건을 만족해야 실행 가능</li>
          <li>연속 실패(attempts 3+)는 운영 경고 대상</li>
          <li>Approver는 조회만 가능, 실행은 Operator/Admin만</li>
        </ul>
      </div>
    </main>
  );
}
