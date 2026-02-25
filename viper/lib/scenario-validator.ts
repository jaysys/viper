import { getAdminConfig, getAllFeasibility, getApprovalHistory, getCaptures, getFormScenarios, getQuotes, getReceptionJobs, getRequests, getSatellites, getTemplates, getTimeline, getUplinkAllocationTests, getUplinkJobs, getValidationRules } from "@/lib/mock";

export function validateMockScenarios() {
  const errors: string[] = [];
  const requests = getRequests();
  const quotes = getQuotes();
  const feasibility = getAllFeasibility();
  const uplink = getUplinkJobs();
  const reception = getReceptionJobs();
  const formScenarios = getFormScenarios();
  const rules = getValidationRules();
  const templates = getTemplates("ALL");
  const adminConfig = getAdminConfig();
  const satellites = getSatellites();
  const uplinkAllocationTests = getUplinkAllocationTests();
  const satMap = new Map(satellites.map((s) => [s.satellite_id, s]));
  const reqMap = new Map(requests.map((r) => [r.id, r]));
  const quoteMap = new Map(quotes.map((q) => [q.request_id, q]));

  const validStatuses = new Set(["Draft", "Requested", "Approved", "Tasked", "Acquired", "Downlinked", "Processing", "QA", "Delivered", "Completed", "Failed", "Cancelled"]);
  const isWithinContactWindow = (satelliteId: string, scheduledAt: string) => {
    const sat = satMap.get(satelliteId);
    if (!sat) return false;
    const t = Date.parse(scheduledAt);
    if (Number.isNaN(t)) return false;
    return sat.contact_windows.some((w) => {
      const start = Date.parse(w.start);
      const end = Date.parse(w.end);
      return !Number.isNaN(start) && !Number.isNaN(end) && t >= start && t <= end;
    });
  };

  const evalAllocation = (tc: (typeof uplinkAllocationTests)[number]) => {
    const req = reqMap.get(tc.request_id);
    const sat = satMap.get(tc.satellite_id);
    const quote = quoteMap.get(tc.request_id);
    if (!req || !sat || !quote) return false;
    if (quote.approval_state !== "APPROVED") return false;
    if (sat.status !== "AVAILABLE") return false;
    if (!sat.sensors.includes(req.sensor)) return false;
    if (sat.assigned_today >= sat.daily_capacity) return false;
    if (!isWithinContactWindow(sat.satellite_id, tc.scheduled_at)) return false;
    return true;
  };
  const validatePreferredSatellitesForScenario = (scenario: (typeof formScenarios)[number]) => {
    const ids = scenario.preferred_satellite_ids ?? [];
    if (ids.length === 0) return true;
    if (ids.length > 3) return false;
    const uniq = new Set<string>();
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
  };

  for (const r of requests) {
    if (!validStatuses.has(r.status)) errors.push(`requests.status invalid: ${r.id} -> ${r.status}`);
    if (!quotes.find((q) => q.request_id === r.id)) errors.push(`quote missing for request: ${r.id}`);
    if (getTimeline(r.id).length === 0) errors.push(`timeline missing for request: ${r.id}`);
    if (getCaptures(r.id).length === 0) errors.push(`captures missing for request: ${r.id}`);
    if (!feasibility.find((f) => f.request_id === r.id)) errors.push(`feasibility missing for request: ${r.id}`);
    if (getApprovalHistory(r.id).length === 0) errors.push(`approval-history missing for request: ${r.id}`);
  }

  if (!quotes.some((q) => q.approval_state === "REQUESTED")) errors.push("approval queue scenario missing: no REQUESTED quote");
  if (!feasibility.some((f) => f.success_grade === "LOW")) errors.push("feasibility LOW scenario missing");

  for (const f of feasibility) {
    if (f.success_probability < 0 || f.success_probability > 1) errors.push(`feasibility probability out of range: ${f.request_id}`);
  }

  for (const r of requests) {
    for (const c of getCaptures(r.id)) {
      if ((c.quality === "FAIL" || c.quality === "CONDITIONAL") && !c.reject_reason_code) {
        errors.push(`reject_reason_code missing: ${r.id}/${c.capture_id}`);
      }
      if (!c.trace_id) errors.push(`trace_id missing: ${r.id}/${c.capture_id}`);
    }
  }

  for (const u of uplink) {
    if (!satMap.has(u.satellite_id)) errors.push(`uplink satellite missing in fleet: ${u.job_id}/${u.satellite_id}`);
    if (!u.scheduled_at) errors.push(`uplink scheduled_at missing: ${u.job_id}`);
    if (u.status === "ACKED" && (!u.last_ack || !u.response_code?.startsWith("ACK"))) {
      errors.push(`uplink ACKED invalid ack fields: ${u.job_id}`);
    }
    if (u.status === "FAILED" && (!u.response_code || u.attempts < 1)) {
      errors.push(`uplink FAILED invalid fields: ${u.job_id}`);
    }
  }

  if (satellites.length < 4) errors.push("satellite fleet insufficient (need >=4)");
  if (!satellites.some((s) => s.status === "MAINTENANCE")) errors.push("satellite maintenance scenario missing");
  if (!satellites.some((s) => s.status === "DEGRADED")) errors.push("satellite degraded scenario missing");
  if (!satellites.some((s) => s.sensors.length > 1)) errors.push("multisensor satellite scenario missing");

  if (uplinkAllocationTests.length < 6) errors.push("uplink allocation tests insufficient");
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
    if (r.downlink === "RECEIVED" && !r.downlink_received_at) errors.push(`reception received_at missing: ${r.request_id}`);
    if (r.checksum === "MISMATCH" && r.pipeline !== "BLOCKED") errors.push(`checksum mismatch must be blocked: ${r.request_id}`);
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

  if (!templates.some((t) => t.scope === "PERSONAL")) errors.push("templates missing PERSONAL scope");
  if (!templates.some((t) => t.scope === "ORG")) errors.push("templates missing ORG scope");
  if (!adminConfig.policies.some((p) => p.key === "mfa_required_for_sensitive_routes" && p.value === true)) {
    errors.push("admin-config mfa policy missing/invalid");
  }
  if (!adminConfig.audit_logs.some((x) => x.result === "DENY")) {
    errors.push("admin-config audit deny case missing");
  }

  return {
    pass: errors.length === 0,
    errors,
    stats: {
      requests: requests.length,
      feasibility: feasibility.length,
      quotes: quotes.length,
      uplink: uplink.length,
      fleet: satellites.length,
      uplinkAllocation: uplinkAllocationTests.length,
      reception: reception.length,
      formScenarios: formScenarios.length,
      templates: templates.length,
      adminPolicies: adminConfig.policies.length
    }
  };
}
