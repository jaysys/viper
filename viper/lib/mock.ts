import requests from "@/data/mock/requests.json";
import quotes from "@/data/mock/quotes.json";
import timelines from "@/data/mock/timelines.json";
import captures from "@/data/mock/captures.json";
import validationRules from "@/data/mock/validation-rules.json";
import uplinkJobs from "@/data/mock/uplink-jobs.json";
import receptionJobs from "@/data/mock/reception-jobs.json";
import requestFormScenarios from "@/data/mock/request-form-scenarios.json";
import feasibility from "@/data/mock/feasibility.json";
import approvalHistory from "@/data/mock/approval-history.json";
import templates from "@/data/mock/templates.json";
import adminConfig from "@/data/mock/admin-config.json";
import satellites from "@/data/mock/satellites.json";
import uplinkAllocationTests from "@/data/mock/uplink-allocation-tests.json";

export type RequestItem = (typeof requests)[number];
export type QuoteItem = (typeof quotes)[number];
export type UplinkJob = (typeof uplinkJobs)[number];
export type ReceptionJob = (typeof receptionJobs)[number];
export type FormScenario = (typeof requestFormScenarios)[number];
export type TemplateItem = (typeof templates)[number];
export type SatelliteItem = (typeof satellites)[number];
export type UplinkAllocationTest = (typeof uplinkAllocationTests)[number];

type TimelineMap = Record<string, string[]>;
type CaptureMap = Record<
  string,
  Array<{
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
  }>
>;

type FeasibilityMap = Record<
  string,
  {
    success_grade: string;
    success_probability: number;
    base_window: string;
    drivers: string[];
    alternatives: Array<{ window: string; grade: string; probability: number }>;
    relaxation: { cloud_pct_before: number; cloud_pct_after: number; delta_probability: number };
    model_version: string;
  }
>;

type ApprovalHistoryMap = Record<
  string,
  Array<{ step: string; actor: string; at: string; comment: string }>
>;

export function getRequests(): RequestItem[] {
  return requests;
}

export function getRequestById(requestId: string): RequestItem | undefined {
  return requests.find((r) => r.id === requestId);
}

export function getRequestsByStatus(status: string | undefined): RequestItem[] {
  if (!status || status === "ALL") return requests;
  return requests.filter((r) => r.status.toUpperCase() === status.toUpperCase());
}

export function getQuotes(): QuoteItem[] {
  return quotes;
}

export function getQuoteByRequestId(requestId: string): QuoteItem | undefined {
  return quotes.find((q) => q.request_id === requestId);
}

export function getTimeline(requestId: string): string[] {
  return (timelines as TimelineMap)[requestId] ?? [];
}

export function getCaptures(requestId: string) {
  return (captures as CaptureMap)[requestId] ?? [];
}

export function getValidationRules() {
  return validationRules;
}

export function getUplinkJobs(): UplinkJob[] {
  return uplinkJobs;
}

export function getReceptionJobs(): ReceptionJob[] {
  return receptionJobs;
}

export function getFormScenarios(): FormScenario[] {
  return requestFormScenarios;
}

export function getFeasibilityByRequestId(requestId: string) {
  return (feasibility as FeasibilityMap)[requestId];
}

export function getAllFeasibility() {
  return Object.entries(feasibility as FeasibilityMap).map(([request_id, value]) => ({
    request_id,
    ...value
  }));
}

export function getApprovalHistory(requestId: string) {
  return (approvalHistory as ApprovalHistoryMap)[requestId] ?? [];
}

export function getQuotesByApprovalStatus(status: string | undefined): QuoteItem[] {
  if (!status || status === "ALL") return quotes;
  return quotes.filter((q) => q.approval_state.toUpperCase() === status.toUpperCase());
}

export function getTemplates(scope: string | undefined): TemplateItem[] {
  if (!scope || scope === "ALL") return templates;
  return templates.filter((t) => t.scope.toUpperCase() === scope.toUpperCase());
}

export function getAdminConfig() {
  return adminConfig;
}

export function getSatellites(): SatelliteItem[] {
  return satellites;
}

export function getUplinkAllocationTests(): UplinkAllocationTest[] {
  return uplinkAllocationTests;
}

export function validateFormScenario(s: FormScenario): string[] {
  const rules = validationRules;
  const errors: string[] = [];

  if (s.aoi_km2 < rules.aoi.min_km2 || s.aoi_km2 > rules.aoi.max_km2) {
    errors.push(`AOI 면적 범위 위반 (${rules.aoi.min_km2}~${rules.aoi.max_km2} km2)`);
  }
  if (s.vertex > rules.aoi.max_vertex) {
    errors.push(`AOI vertex 초과 (max ${rules.aoi.max_vertex})`);
  }
  if (s.lead_hours < rules.time.min_lead_hours) {
    errors.push(`Lead time 부족 (min ${rules.time.min_lead_hours}h)`);
  }
  if (s.window_minutes < rules.time.min_window_minutes) {
    errors.push(`Window 길이 부족 (min ${rules.time.min_window_minutes}m)`);
  }

  if (s.sensor === "EO") {
    if (typeof s.cloud_pct === "number" && s.cloud_pct > rules.eo.max_cloud_pct) {
      errors.push(`EO cloud_pct 초과 (max ${rules.eo.max_cloud_pct}%)`);
    }
    if (typeof s.off_nadir === "number" && s.off_nadir > rules.eo.off_nadir_max) {
      errors.push(`EO off_nadir 초과 (max ${rules.eo.off_nadir_max})`);
    }
  }

  if (s.sensor === "SAR") {
    if (typeof s.incidence === "number") {
      if (s.incidence < rules.sar.incidence_min || s.incidence > rules.sar.incidence_max) {
        errors.push(`SAR incidence 범위 위반 (${rules.sar.incidence_min}~${rules.sar.incidence_max})`);
      }
    } else {
      errors.push("SAR incidence 값 누락");
    }
  }

  return errors;
}
