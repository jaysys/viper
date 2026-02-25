export type FormScenario = {
  id: string;
  label: string;
  request_name: string;
  sensor: "EO" | "SAR";
  aoi_km2: number;
  vertex: number;
  lead_hours: number;
  window_minutes: number;
  cloud_pct: number | null;
  off_nadir: number | null;
  incidence: number | null;
  preferred_satellite_ids?: string[];
};

export type ValidationRules = {
  aoi: { min_km2: number; max_km2: number; max_vertex: number };
  time: { min_lead_hours: number; min_window_minutes: number; max_future_days: number };
  eo: { max_cloud_pct: number; off_nadir_max: number };
  sar: { incidence_min: number; incidence_max: number };
};

export type RequestItem = {
  id: string;
  name: string;
  requester: string;
  sensor: "EO" | "SAR";
  priority: string;
  status: string;
  window_start: string;
  window_end: string;
  aoi_km2: number;
};

export type QuoteItem = {
  request_id: string;
  currency: string;
  base_cost: number;
  sla_cost: number;
  options_cost: number;
  total: number;
  approval_state: string;
};

export type FeasibilityItem = {
  request_id: string;
  success_grade: string;
  success_probability: number;
  base_window: string;
  drivers: string[];
  alternatives: Array<{ window: string; grade: string; probability: number }>;
  relaxation: { cloud_pct_before: number; cloud_pct_after: number; delta_probability: number };
  model_version: string;
};

export type CaptureItem = {
  capture_id: string;
  quality: string;
  cloud_pct: number;
  resolution_m: number;
  delivery: string;
  reject_reason_code: string | null;
  trace_id: string;
  capture_mode?: string;
  sensor_type?: string;
  acquired_at?: string;
  thumbnail_url?: string;
  full_url?: string;
  source?: string;
  license?: string;
};

export type UplinkJob = {
  job_id: string;
  request_id: string;
  satellite_id: string;
  operator: string;
  status: string;
  attempts: number;
  response_code: string | null;
  last_ack: string | null;
  scheduled_at?: string;
};

export type SatelliteItem = {
  satellite_id: string;
  name: string;
  sensors: string[];
  status: string;
  health_score: number;
  daily_capacity: number;
  assigned_today: number;
  contact_windows: Array<{ start: string; end: string; ground_station: string }>;
};

export type UplinkAllocationTest = {
  id: string;
  type: "normal" | "abnormal";
  request_id: string;
  satellite_id: string;
  scheduled_at: string;
  expected: "ALLOW" | "DENY";
  reason_code: string;
  primary_failed_satellite_id?: string;
};

export type ReceptionJob = {
  request_id: string;
  downlink: string;
  downlink_received_at: string | null;
  checksum: string;
  pipeline: string;
  qa: string;
};

export type ApprovalHistoryItem = { step: string; actor: string; at: string; comment: string };
export type DashboardData = {
  role: "requester" | "operator" | "approver" | "admin";
  kpis: Array<{ key: string; label: string; value: number }>;
  alerts: Array<{ id: string; level: string; message: string }>;
  widgets: string[];
};
export type TemplateItem = {
  template_id: string;
  name: string;
  owner: string;
  scope: "PERSONAL" | "ORG";
  sensor: "EO" | "SAR";
  version: number;
  status: "ACTIVE" | "ARCHIVED";
  shared_org: string;
  last_used_at: string | null;
};
export type AdminConfig = {
  quotas: Array<{ org: string; monthly_task_limit: number; used: number; credit_balance: number }>;
  policies: Array<{ key: string; value: string | number | boolean; updated_by: string; updated_at: string }>;
  approval_lines: Array<{ name: string; max_without_escalation: number; approvers: string[] }>;
  audit_logs: Array<{ id: string; actor: string; action: string; target: string; result: string; at: string }>;
};

async function apiFetch<T>(url: string): Promise<T> {
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const target = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const res = await fetch(target, { cache: "no-store" });
  if (!res.ok) throw new Error(`Mock API failed: ${url} -> ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchRequests(status = "ALL") {
  return apiFetch<{ items: RequestItem[] }>(`/api/mock/requests?status=${encodeURIComponent(status)}`);
}

export async function fetchRequestById(requestId: string) {
  return apiFetch<RequestItem>(`/api/mock/requests/${encodeURIComponent(requestId)}`);
}

export async function fetchQuotes(status = "ALL") {
  return apiFetch<{ items: QuoteItem[] }>(`/api/mock/quotes?status=${encodeURIComponent(status)}`);
}

export async function fetchQuoteBundle(requestId: string) {
  return apiFetch<{ quote: QuoteItem; history: ApprovalHistoryItem[] }>(`/api/mock/quotes/${encodeURIComponent(requestId)}`);
}

export async function fetchFeasibilityList() {
  return apiFetch<{ items: FeasibilityItem[] }>("/api/mock/feasibility");
}

export async function fetchFeasibilityById(requestId: string) {
  return apiFetch<Omit<FeasibilityItem, "request_id">>(`/api/mock/feasibility/${encodeURIComponent(requestId)}`);
}

export async function fetchCaptures(requestId: string) {
  return apiFetch<{ items: CaptureItem[] }>(`/api/mock/captures/${encodeURIComponent(requestId)}`);
}

export async function fetchTimeline(requestId: string) {
  return apiFetch<{ items: string[] }>(`/api/mock/timelines/${encodeURIComponent(requestId)}`);
}

export async function fetchUplinkJobs() {
  return apiFetch<{ items: UplinkJob[] }>("/api/mock/uplink");
}

export async function fetchSatellites() {
  return apiFetch<{ items: SatelliteItem[] }>("/api/mock/satellites");
}

export async function fetchUplinkAllocationTests() {
  return apiFetch<{ items: UplinkAllocationTest[] }>("/api/mock/uplink-allocation-tests");
}

export async function fetchReceptionJobs() {
  return apiFetch<{ items: ReceptionJob[] }>("/api/mock/reception");
}

export async function fetchValidationRules() {
  return apiFetch<ValidationRules>("/api/mock/validation-rules");
}

export async function fetchFormScenarios() {
  return apiFetch<{ items: FormScenario[] }>("/api/mock/form-scenarios");
}

export async function fetchDashboard(role: "requester" | "operator" | "approver" | "admin") {
  return apiFetch<DashboardData>(`/api/mock/dashboard?role=${encodeURIComponent(role)}`);
}

export async function fetchTemplates(scope = "ALL") {
  return apiFetch<{ items: TemplateItem[] }>(`/api/mock/templates?scope=${encodeURIComponent(scope)}`);
}

export async function fetchAdminConfig() {
  return apiFetch<AdminConfig>("/api/mock/admin-config");
}

export function validateFormScenarioWithRules(s: FormScenario, rules: ValidationRules): string[] {
  const errors: string[] = [];

  if (s.aoi_km2 < rules.aoi.min_km2 || s.aoi_km2 > rules.aoi.max_km2) {
    errors.push(`AOI 면적 범위 위반 (${rules.aoi.min_km2}~${rules.aoi.max_km2} km2)`);
  }
  if (s.vertex > rules.aoi.max_vertex) errors.push(`AOI vertex 초과 (max ${rules.aoi.max_vertex})`);
  if (s.lead_hours < rules.time.min_lead_hours) errors.push(`Lead time 부족 (min ${rules.time.min_lead_hours}h)`);
  if (s.window_minutes < rules.time.min_window_minutes) errors.push(`Window 길이 부족 (min ${rules.time.min_window_minutes}m)`);

  if (s.sensor === "EO") {
    if (typeof s.cloud_pct === "number" && s.cloud_pct > rules.eo.max_cloud_pct) {
      errors.push(`EO cloud_pct 초과 (max ${rules.eo.max_cloud_pct}%)`);
    }
    if (typeof s.off_nadir === "number" && s.off_nadir > rules.eo.off_nadir_max) {
      errors.push(`EO off_nadir 초과 (max ${rules.eo.off_nadir_max})`);
    }
  }

  if (s.sensor === "SAR") {
    if (typeof s.incidence !== "number" || s.incidence < rules.sar.incidence_min || s.incidence > rules.sar.incidence_max) {
      errors.push(`SAR incidence 범위 위반 (${rules.sar.incidence_min}~${rules.sar.incidence_max})`);
    }
  }

  return errors;
}

export function validatePreferredSatellites(
  sensor: "EO" | "SAR",
  preferredSatelliteIds: string[] | undefined,
  satellites: SatelliteItem[]
): string[] {
  const errors: string[] = [];
  const selected = preferredSatelliteIds ?? [];
  if (selected.length === 0) return errors;
  if (selected.length > 3) errors.push("선호 위성은 최대 3개까지 지정할 수 있습니다");
  if (new Set(selected).size !== selected.length) errors.push("선호 위성 중복 지정은 허용되지 않습니다");

  const satMap = new Map(satellites.map((s) => [s.satellite_id, s]));
  let compatibleCount = 0;

  for (const satId of selected) {
    const sat = satMap.get(satId);
    if (!sat) {
      errors.push(`선호 위성 미등록: ${satId}`);
      continue;
    }
    if (!sat.sensors.includes(sensor)) {
      errors.push(`요청 센서(${sensor})와 위성 센서 불일치: ${satId}`);
      continue;
    }
    if (sat.status === "MAINTENANCE") {
      errors.push(`정비 중 위성은 선호 지정 불가: ${satId}`);
      continue;
    }
    compatibleCount += 1;
  }

  if (selected.length > 0 && compatibleCount === 0) {
    errors.push("선호 위성 중 실제 할당 가능한 후보가 없습니다");
  }

  return errors;
}
