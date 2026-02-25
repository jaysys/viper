import fs from "node:fs";
import path from "node:path";

const base = path.resolve("/Users/jaehojoo/Desktop/codex-lgcns-workspace/viper/data/mock");
const read = (name) => JSON.parse(fs.readFileSync(path.join(base, name), "utf8"));

const requests = read("requests.json");
const quotes = read("quotes.json");
const timelines = read("timelines.json");
const captures = read("captures.json");
const rules = read("validation-rules.json");
const uplink = read("uplink-jobs.json");
const reception = read("reception-jobs.json");
const formScenarios = read("request-form-scenarios.json");
const feasibility = read("feasibility.json");
const approvalHistory = read("approval-history.json");
const templates = read("templates.json");
const adminConfig = read("admin-config.json");
const satellites = read("satellites.json");
const uplinkAllocationTests = read("uplink-allocation-tests.json");

const ownershipViolations = read("ownership-violations.json");
const stateTransitions = read("state-transition-tests.json");
const slaAlerts = read("sla-alerts.json");
const securityTests = read("security-policy-tests.json");
const bulkRequests = read("bulk-requests.json");

const errors = [];
const validStatuses = new Set(["Draft", "Requested", "Approved", "Tasked", "Acquired", "Downlinked", "Processing", "QA", "Delivered", "Completed", "Failed", "Cancelled"]);
const satMap = new Map(satellites.map((s) => [s.satellite_id, s]));
const reqMap = new Map(requests.map((r) => [r.id, r]));
const quoteMap = new Map(quotes.map((q) => [q.request_id, q]));

function isWithinContactWindow(sat, scheduledAt) {
  if (!scheduledAt) return false;
  const t = Date.parse(scheduledAt);
  if (Number.isNaN(t)) return false;
  return sat.contact_windows.some((w) => {
    const start = Date.parse(w.start);
    const end = Date.parse(w.end);
    return !Number.isNaN(start) && !Number.isNaN(end) && t >= start && t <= end;
  });
}

function evalAllocation(tc) {
  const req = reqMap.get(tc.request_id);
  const sat = satMap.get(tc.satellite_id);
  const quote = quoteMap.get(tc.request_id);
  if (!req || !sat || !quote) return false;
  if (quote.approval_state !== "APPROVED") return false;
  if (sat.status !== "AVAILABLE") return false;
  if (!sat.sensors.includes(req.sensor)) return false;
  if (sat.assigned_today >= sat.daily_capacity) return false;
  if (!isWithinContactWindow(sat, tc.scheduled_at)) return false;
  return true;
}

function validatePreferredSatellitesForScenario(scenario) {
  const ids = scenario.preferred_satellite_ids ?? [];
  if (ids.length === 0) return true;
  if (ids.length > 3) return false;
  const uniq = new Set();
  let compatibleCount = 0;
  for (const satId of ids) {
    if (uniq.has(satId)) return false;
    uniq.add(satId);
    const sat = satMap.get(satId);
    if (!sat) return false;
    if (!sat.sensors.includes(scenario.sensor)) return false;
    if (sat.status === "MAINTENANCE") return false;
    compatibleCount += 1;
  }
  return compatibleCount > 0;
}

for (const r of requests) {
  if (!validStatuses.has(r.status)) errors.push(`requests.status invalid: ${r.id} -> ${r.status}`);
  if (!quotes.find((q) => q.request_id === r.id)) errors.push(`quote missing for request: ${r.id}`);
  if (!timelines[r.id]) errors.push(`timeline missing for request: ${r.id}`);
  if (!captures[r.id]) errors.push(`captures missing for request: ${r.id}`);
  if (!feasibility[r.id]) errors.push(`feasibility missing for request: ${r.id}`);
  if (!approvalHistory[r.id]) errors.push(`approval-history missing for request: ${r.id}`);
}

if (!quotes.some((q) => q.approval_state === "REQUESTED")) {
  errors.push("approval queue scenario missing: no REQUESTED quote");
}
if (!Object.values(feasibility).some((f) => f.success_grade === "LOW")) {
  errors.push("feasibility LOW scenario missing");
}

for (const [rid, f] of Object.entries(feasibility)) {
  if (!requests.find((r) => r.id === rid)) errors.push(`feasibility orphan request_id: ${rid}`);
  if (typeof f.success_probability !== "number" || f.success_probability < 0 || f.success_probability > 1) {
    errors.push(`feasibility probability out of range: ${rid}`);
  }
  if (!Array.isArray(f.alternatives) || f.alternatives.length === 0) errors.push(`feasibility alternatives missing: ${rid}`);
}

for (const [rid, list] of Object.entries(approvalHistory)) {
  if (!requests.find((r) => r.id === rid)) errors.push(`approval-history orphan request_id: ${rid}`);
  if (!Array.isArray(list) || list.length === 0) errors.push(`approval-history empty: ${rid}`);
}

for (const [rid, list] of Object.entries(captures)) {
  for (const c of list) {
    if ((c.quality === "FAIL" || c.quality === "CONDITIONAL") && !c.reject_reason_code) {
      errors.push(`reject_reason_code missing: ${rid}/${c.capture_id}`);
    }
    if (!c.trace_id) errors.push(`trace_id missing: ${rid}/${c.capture_id}`);
  }
}

for (const u of uplink) {
  if (!satMap.has(u.satellite_id)) {
    errors.push(`uplink satellite missing in fleet: ${u.job_id}/${u.satellite_id}`);
  }
  if (!u.scheduled_at) {
    errors.push(`uplink scheduled_at missing: ${u.job_id}`);
  }
  if (u.status === "ACKED" && (!u.last_ack || !u.response_code?.startsWith("ACK"))) {
    errors.push(`uplink ACKED invalid ack fields: ${u.job_id}`);
  }
  if (u.status === "FAILED" && (!u.response_code || u.attempts < 1)) {
    errors.push(`uplink FAILED invalid fields: ${u.job_id}`);
  }
}

if (!Array.isArray(satellites) || satellites.length < 4) {
  errors.push("satellite fleet insufficient (need >=4)");
}
if (!satellites.some((s) => s.status === "MAINTENANCE")) {
  errors.push("satellite maintenance scenario missing");
}
if (!satellites.some((s) => s.status === "DEGRADED")) {
  errors.push("satellite degraded scenario missing");
}
if (!satellites.some((s) => Array.isArray(s.sensors) && s.sensors.length > 1)) {
  errors.push("multisensor satellite scenario missing");
}
for (const s of satellites) {
  if (s.assigned_today > s.daily_capacity) {
    errors.push(`satellite assigned exceeds capacity: ${s.satellite_id}`);
  }
}

if (!Array.isArray(uplinkAllocationTests) || uplinkAllocationTests.length < 6) {
  errors.push("uplink allocation tests insufficient");
}
if (!uplinkAllocationTests.some((t) => t.expected === "ALLOW")) errors.push("uplink allocation ALLOW case missing");
if (!uplinkAllocationTests.some((t) => t.expected === "DENY")) errors.push("uplink allocation DENY case missing");
for (const tc of uplinkAllocationTests) {
  if (!reqMap.has(tc.request_id)) errors.push(`uplink allocation orphan request: ${tc.id}`);
  if (!satMap.has(tc.satellite_id)) errors.push(`uplink allocation orphan satellite: ${tc.id}`);
  const actual = evalAllocation(tc) ? "ALLOW" : "DENY";
  if (actual !== tc.expected) errors.push(`uplink allocation mismatch: ${tc.id} expected=${tc.expected} actual=${actual}`);
  if (tc.primary_failed_satellite_id && !satMap.has(tc.primary_failed_satellite_id)) {
    errors.push(`uplink allocation invalid primary_failed_satellite_id: ${tc.id}`);
  }
}

for (const r of reception) {
  if (r.downlink === "RECEIVED" && !r.downlink_received_at) {
    errors.push(`reception received_at missing: ${r.request_id}`);
  }
  if (r.checksum === "MISMATCH" && r.pipeline !== "BLOCKED") {
    errors.push(`checksum mismatch must be blocked: ${r.request_id}`);
  }
}

for (const s of formScenarios) {
  if (s.aoi_km2 > rules.aoi.max_km2 && s.id === "FORM-OK-001") {
    errors.push(`form scenario mislabeled OK with invalid AOI: ${s.id}`);
  }
  const prefValid = validatePreferredSatellitesForScenario(s);
  if (s.id.startsWith("FORM-OK") && !prefValid) {
    errors.push(`form preferred_satellite_ids invalid for OK case: ${s.id}`);
  }
  if (s.id.startsWith("FORM-ERR-PREF") && prefValid) {
    errors.push(`form preferred_satellite_ids should fail for ERR case: ${s.id}`);
  }
}

// 신규 미포함 항목 검증
for (const t of ownershipViolations) {
  if (t.actor_role !== "requester") errors.push(`ownership invalid role: ${t.id}`);
  if (t.expected !== "DENY") errors.push(`ownership expected must be DENY: ${t.id}`);
  if (t.actor_id === t.resource_owner) errors.push(`ownership actor/owner must differ: ${t.id}`);
}

for (const t of stateTransitions) {
  if (t.from === "Delivered" && t.to === "Assigned" && t.expected !== "DENY") {
    errors.push(`state rollback must be DENY: ${t.id}`);
  }
  if (t.from === t.to && !t.idempotency_key) {
    errors.push(`idempotent transition needs key: ${t.id}`);
  }
}

for (const a of slaAlerts) {
  if (a.type === "WINDOW_EXPIRY_IMMINENT" && !(a.current_minutes < a.threshold_minutes)) {
    errors.push(`sla imminent window invalid threshold: ${a.id}`);
  }
  if (a.type === "LEAD_TIME_VIOLATION" && !(a.current_hours < a.threshold_hours)) {
    errors.push(`sla lead-time violation invalid threshold: ${a.id}`);
  }
  if (a.type === "PARTIAL_FULFILLMENT" && !(a.actual_coverage_pct < a.required_coverage_pct)) {
    errors.push(`sla partial fulfillment invalid coverage: ${a.id}`);
  }
}

for (const s of securityTests) {
  if (s.route.startsWith("/ops/") && s.network !== "internal_or_vpn" && s.expected !== "DENY") {
    errors.push(`security external ops access must deny: ${s.id}`);
  }
  if (s.route === "/ops/admin" && s.mfa === false && s.expected !== "DENY") {
    errors.push(`security admin without mfa must deny: ${s.id}`);
  }
}

if (!bulkRequests.meta || bulkRequests.meta.count < bulkRequests.meta.page_size) {
  errors.push("bulk meta invalid: count/page_size");
}
if (!Array.isArray(bulkRequests.samples) || bulkRequests.samples.length < 3) {
  errors.push("bulk samples insufficient");
}

if (!Array.isArray(templates) || templates.length < 2) {
  errors.push("templates dataset insufficient");
}
if (!templates.some((t) => t.scope === "PERSONAL")) errors.push("templates missing PERSONAL scope");
if (!templates.some((t) => t.scope === "ORG")) errors.push("templates missing ORG scope");
for (const t of templates) {
  if (!["ACTIVE", "ARCHIVED"].includes(t.status)) errors.push(`templates invalid status: ${t.template_id}`);
}

if (!adminConfig || !Array.isArray(adminConfig.policies) || adminConfig.policies.length === 0) {
  errors.push("admin-config policies missing");
}
if (!adminConfig.policies.some((p) => p.key === "mfa_required_for_sensitive_routes" && p.value === true)) {
  errors.push("admin-config mfa policy missing/invalid");
}
if (!Array.isArray(adminConfig.audit_logs) || adminConfig.audit_logs.length === 0) {
  errors.push("admin-config audit logs missing");
}
if (!adminConfig.audit_logs.some((x) => x.result === "DENY")) {
  errors.push("admin-config audit deny case missing");
}

if (errors.length > 0) {
  console.error("[FAIL] mock scenario validation");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log("[PASS] mock scenario validation");
console.log(
  `requests=${requests.length}, feasibility=${Object.keys(feasibility).length}, quotes=${quotes.length}, uplink=${uplink.length}, fleet=${satellites.length}, uplinkAlloc=${uplinkAllocationTests.length}, reception=${reception.length}, formScenarios=${formScenarios.length}, templates=${templates.length}, adminPolicies=${adminConfig.policies.length}, ownership=${ownershipViolations.length}, transitions=${stateTransitions.length}, sla=${slaAlerts.length}, security=${securityTests.length}`
);
