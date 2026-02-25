import Link from "next/link";
import AccessPanel from "@/components/AccessPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import StatusBadge from "@/components/StatusBadge";
import { normalizeRole } from "@/lib/authz";
import { requireRouteAccess } from "@/lib/guard";
import { fetchFormScenarios, fetchSatellites, fetchValidationRules, validateFormScenarioWithRules, validatePreferredSatellites } from "@/lib/mock-api";

type Props = {
  searchParams: Promise<{ as?: string; case?: string; pref?: string }>;
};

export default async function NewRequestPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = normalizeRole(params.as);
  const route = "/portal/requests";
  const permission = requireRouteAccess(role, "POST", route);

  const [{ items: scenarios }, rules, { items: satellites }] = await Promise.all([
    fetchFormScenarios(),
    fetchValidationRules(),
    fetchSatellites(),
  ]);
  const selected = scenarios.find((s) => s.id === params.case) ?? scenarios[0];
  const preferredOverride = params.pref
    ? params.pref.split(",").map((x) => x.trim()).filter(Boolean)
    : selected.preferred_satellite_ids ?? [];
  const errors = [
    ...validateFormScenarioWithRules(selected, rules),
    ...validatePreferredSatellites(selected.sensor, preferredOverride, satellites),
  ];
  const compatible = satellites.filter((s) => s.sensors.includes(selected.sensor) && s.status !== "MAINTENANCE");
  const togglePref = (satelliteId: string) => {
    const set = new Set(preferredOverride);
    if (set.has(satelliteId)) set.delete(satelliteId);
    else set.add(satelliteId);
    return Array.from(set).join(",");
  };

  return (
    <main>
      <h1>SCR-002 촬영요청 생성</h1>
      <RoleSwitcher role={role} path="/portal/requests/new" />
      <AccessPanel role={role} route={route} method="POST" allowed={permission.allowed} reason={permission.reason} />

      <div className="card">
        <strong>시나리오 선택</strong>
        <div className="row">
          {scenarios.map((s) => (
            <Link key={s.id} href={`/portal/requests/new?as=${role}&case=${s.id}`} className={selected.id === s.id ? "pill active" : "pill"}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <strong>입력값 미리보기</strong>
          <p>요청명: <code>{selected.request_name}</code></p>
          <p>센서: <code>{selected.sensor}</code></p>
          <p>AOI: <code>{selected.aoi_km2} km2 / vertex {selected.vertex}</code></p>
          <p>시간: <code>lead {selected.lead_hours}h / window {selected.window_minutes}m</code></p>
          <p>EO: <code>cloud {selected.cloud_pct ?? "-"}% / off-nadir {selected.off_nadir ?? "-"}</code></p>
          <p>SAR: <code>incidence {selected.incidence ?? "-"}</code></p>
          <p>선호 위성: <code>{preferredOverride.length > 0 ? preferredOverride.join(", ") : "-"}</code></p>
          <div style={{ marginTop: 8 }}>
            <strong>선호 위성 지정(요청자 시뮬레이션)</strong>
            <div className="row">
              {compatible.map((sat) => {
                const selectedPref = preferredOverride.includes(sat.satellite_id);
                return (
                  <Link
                    key={sat.satellite_id}
                    href={`/portal/requests/new?as=${role}&case=${selected.id}&pref=${encodeURIComponent(togglePref(sat.satellite_id))}`}
                    className={selectedPref ? "pill active" : "pill"}
                  >
                    {sat.satellite_id}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <strong>검증 결과</strong>
          {errors.length === 0 ? <p><StatusBadge text="VALID" /> 제출 가능</p> : null}
          {errors.length > 0 ? (
            <>
              <p><StatusBadge text="INVALID" /> 제출 차단</p>
              <ul>
                {errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <div className="card">
        <strong>VAL 기준</strong>
        <p>AOI: {rules.aoi.min_km2}~{rules.aoi.max_km2} km2 / max vertex {rules.aoi.max_vertex}</p>
        <p>Time: lead {rules.time.min_lead_hours}h+ / window {rules.time.min_window_minutes}m+</p>
        <p>선호 위성: 최대 3개 / 센서 일치 / 정비(MAINTENANCE) 제외</p>
      </div>

      <div className="card">
        <Link href={`/portal/orders?as=${role}`}>SCR-005 주문/작전 모니터링으로 이동</Link>
      </div>
    </main>
  );
}
