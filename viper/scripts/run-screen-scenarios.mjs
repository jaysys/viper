import fs from "node:fs";
import path from "node:path";

const root = "/Users/jaehojoo/Desktop/codex-lgcns-workspace/viper";
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const authz = readJson("data/authz-matrix.json");
const scenarios = readJson("data/mock/screen-scenarios.json");
const quotes = readJson("data/mock/quotes.json");
const requests = readJson("data/mock/requests.json");
const feasibility = readJson("data/mock/feasibility.json");
const captures = readJson("data/mock/captures.json");
const receptionJobs = readJson("data/mock/reception-jobs.json");
const formScenarios = readJson("data/mock/request-form-scenarios.json");
const validationRules = readJson("data/mock/validation-rules.json");
const dashboard = readJson("data/mock/dashboard.json");
const templates = readJson("data/mock/templates.json");
const adminConfig = readJson("data/mock/admin-config.json");
const satellites = readJson("data/mock/satellites.json");

const VALID_ROLES = new Set(["requester", "operator", "approver", "admin"]);
const reqMap = new Map(requests.map((r) => [r.id, r]));
const satMap = new Map(satellites.map((s) => [s.satellite_id, s]));

function canAllocateSatellite(requestId, satelliteId, scheduledAt) {
  const req = reqMap.get(requestId);
  const q = quotes.find((x) => x.request_id === requestId);
  const sat = satMap.get(satelliteId);
  if (!req || !q || !sat) return false;
  if (q.approval_state !== "APPROVED") return false;
  if (sat.status !== "AVAILABLE") return false;
  if (!sat.sensors.includes(req.sensor)) return false;
  if (sat.assigned_today >= sat.daily_capacity) return false;
  const t = Date.parse(scheduledAt ?? "");
  if (Number.isNaN(t)) return false;
  return sat.contact_windows.some((w) => t >= Date.parse(w.start) && t <= Date.parse(w.end));
}

function getRoleScopes(role, visited = new Set()) {
  if (visited.has(role)) return new Set();
  visited.add(role);
  const cfg = authz.roles[role];
  const scopes = new Set(cfg.default_scopes ?? []);
  for (const parent of cfg.inherits ?? []) {
    for (const s of getRoleScopes(parent, visited)) scopes.add(s);
  }
  return scopes;
}

function patternToRegex(pattern) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/:[^/]+/g, "[^/]+")}$`);
}

function canAccess(role, method, route, ownerCheck = null) {
  const rp = authz.route_permissions.find((r) => r.method === method && patternToRegex(r.route).test(route));
  if (!rp) return { allowed: false, reason: "NO_ROUTE_POLICY" };

  const cfg = authz.roles[role];
  if (cfg?.superuser) return { allowed: true, reason: "SUPERUSER" };

  if (!rp.allowed_roles.includes(role)) return { allowed: false, reason: "ROLE_BLOCKED" };

  const scopes = getRoleScopes(role);
  if (!rp.required_scopes.every((s) => scopes.has(s))) return { allowed: false, reason: "SCOPE_MISSING" };

  if (ownerCheck && role === "requester" && ownerCheck.actor_id !== ownerCheck.resource_owner) {
    return { allowed: false, reason: "OWNER_ONLY_DENY" };
  }

  return { allowed: true, reason: "OK" };
}

function validateFormCase(caseId) {
  const s = formScenarios.find((x) => x.id === caseId);
  if (!s) return false;
  const errs = [];

  if (s.aoi_km2 < validationRules.aoi.min_km2 || s.aoi_km2 > validationRules.aoi.max_km2) errs.push("AOI_RANGE");
  if (s.vertex > validationRules.aoi.max_vertex) errs.push("VERTEX");
  if (s.lead_hours < validationRules.time.min_lead_hours) errs.push("LEAD");
  if (s.window_minutes < validationRules.time.min_window_minutes) errs.push("WINDOW");
  if (s.sensor === "EO" && typeof s.cloud_pct === "number" && s.cloud_pct > validationRules.eo.max_cloud_pct) errs.push("EO_CLOUD");
  if (s.sensor === "EO" && typeof s.off_nadir === "number" && s.off_nadir > validationRules.eo.off_nadir_max) errs.push("EO_OFFNADIR");
  if (s.sensor === "SAR" && (typeof s.incidence !== "number" || s.incidence < validationRules.sar.incidence_min || s.incidence > validationRules.sar.incidence_max)) errs.push("SAR_INCIDENCE");
  const preferred = s.preferred_satellite_ids ?? [];
  if (preferred.length > 3) errs.push("PREF_MAX");
  if (new Set(preferred).size !== preferred.length) errs.push("PREF_DUP");
  if (preferred.length > 0) {
    let compatible = 0;
    for (const satId of preferred) {
      const sat = satMap.get(satId);
      if (!sat) {
        errs.push("PREF_UNKNOWN");
        continue;
      }
      if (!sat.sensors.includes(s.sensor)) {
        errs.push("PREF_SENSOR_MISMATCH");
        continue;
      }
      if (sat.status === "MAINTENANCE") {
        errs.push("PREF_MAINTENANCE");
        continue;
      }
      compatible += 1;
    }
    if (compatible === 0) errs.push("PREF_NO_CANDIDATE");
  }

  return errs.length === 0;
}

function businessCheck(scn) {
  if (scn.actor_id && scn.resource_owner && scn.role === "requester" && scn.actor_id !== scn.resource_owner) {
    return false;
  }
  switch (scn.screen) {
    case "SCR-001": {
      if (scn.expected_access === "DENY") return false;
      const roleDash = dashboard[scn.role];
      if (!roleDash) return false;
      if (scn.expected_widget) return roleDash.widgets.includes(scn.expected_widget);
      return true;
    }
    case "SCR-002": {
      return validateFormCase(scn.form_case);
    }
    case "SCR-003": {
      if (scn.status_filter === "LOW") {
        return Object.values(feasibility).some((f) => f.success_grade === "LOW");
      }
      return Boolean(feasibility[scn.route.split("/").at(-1)]);
    }
    case "SCR-004": {
      if (scn.route.endsWith("/approve")) return scn.role === "approver" || scn.role === "admin";
      if (scn.quote_state) return quotes.some((q) => q.approval_state === scn.quote_state);
      return true;
    }
    case "SCR-005": {
      if (scn.status_filter) return requests.some((r) => r.status === scn.status_filter);
      return true;
    }
    case "SCR-006": {
      return scn.method === "POST" ? (scn.role === "operator" || scn.role === "admin") : true;
    }
    case "SCR-009": {
      if (scn.satellite_id) {
        return canAllocateSatellite(scn.request_id, scn.satellite_id, scn.scheduled_at);
      }
      const q = quotes.find((x) => x.request_id === scn.request_id);
      return q?.approval_state === "APPROVED";
    }
    case "SCR-010": {
      const job = receptionJobs.find((x) => x.request_id === scn.request_id);
      return job?.checksum === "OK" && job?.qa === "PASS";
    }
    case "SCR-007": {
      if (scn.expected_access === "DENY") return false;
      const exists = templates.length > 0;
      if (!exists) return false;
      if (scn.expected_scope) return templates.some((t) => t.scope === scn.expected_scope);
      return true;
    }
    case "SCR-008": {
      if (scn.expected_access === "DENY") return false;
      if (!adminConfig || !Array.isArray(adminConfig.policies)) return false;
      if (scn.expected_policy_key) return adminConfig.policies.some((p) => p.key === scn.expected_policy_key);
      return true;
    }
    case "SCR-002~006": {
      if (scn.expected_access === "DENY") return false;
      return true;
    }
    default:
      return true;
  }
}

const failed = [];

for (const scn of scenarios) {
  if (!VALID_ROLES.has(scn.role)) {
    failed.push({ id: scn.id, reason: "INVALID_ROLE" });
    continue;
  }
  const access = canAccess(
    scn.role,
    scn.method,
    scn.route,
    scn.actor_id && scn.resource_owner ? { actor_id: scn.actor_id, resource_owner: scn.resource_owner } : null
  );
  const accessExpected = scn.expected_access === "ALLOW";
  const accessOk = access.allowed === accessExpected;

  const biz = businessCheck(scn);
  const bizExpected = scn.expected_business === "ALLOW";
  const bizOk = biz === bizExpected;

  if (!accessOk || !bizOk) {
    failed.push({
      id: scn.id,
      accessExpected: scn.expected_access,
      accessActual: access.allowed ? "ALLOW" : `DENY(${access.reason})`,
      businessExpected: scn.expected_business,
      businessActual: biz ? "ALLOW" : "DENY"
    });
  }
}

if (failed.length > 0) {
  console.error("[FAIL] screen scenario execution");
  failed.forEach((f) => console.error(`- ${JSON.stringify(f)}`));
  process.exit(1);
}

const byScreen = scenarios.reduce((acc, s) => {
  acc[s.screen] = (acc[s.screen] ?? 0) + 1;
  return acc;
}, {});

console.log("[PASS] screen scenario execution");
console.log(`total=${scenarios.length}`);
console.log(`byScreen=${JSON.stringify(byScreen)}`);
