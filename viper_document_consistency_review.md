# viper 문서 정합성 점검 결과

- 점검일: 2026-02-25 (최종 현행화)
- 점검 범위:
  - `satellite_tasking_ui_case_analysis.md`
  - `satellite_tasking_screen_spec.md`
  - `satellite_tasking_menu_ia.md`
  - `satellite_tasking_frontend_tech_spec_recommendation.md`
  - `satellite_tasking_authz_matrix.sample.json`
  - `viper/VIPER_QUICK_START.md`
  - `viper/README.md`
  - `viper/data/authz-matrix.json`
  - `viper/data/mock/*.json`

## 1. 점검 결론

- 중대 충돌: 0건
- 경미한 정합성 이슈: 0건 (기존 이슈 조치 완료 + 최신 반영 완료)
- 최신 구현 범위 반영:
  - `SCR-002` 요청자 선호 위성 지정
  - `SCR-003` 요청 후 타당성 조회(백엔드 산출결과 조회)
  - `SCR-009` 운영자 재할당 시뮬레이터 + 다중 위성 판정

## 2. 충돌 항목 및 조치

1. 권한 소스 파일 기준 혼재
- 현상: 일부 문서가 루트 샘플 JSON만 기준으로 표기
- 조치: 구현 기준 파일을 `viper/data/authz-matrix.json`로 명시하고, 루트 JSON은 샘플로 병기

2. SCR-006 라우트 표기 불일치
- 현상: IA 문서의 라우트 표기가 `/portal/orders/:requestId`로 남아 실제 구현/권한JSON과 불일치
- 조치: `/portal/orders/:requestId/captures`로 통일

3. 운영콘솔 라우트 정책/구현 누락
- 현상: IA 문서에는 `/ops/templates`, `/ops/requests`가 있으나 소스/권한 기준 일부 누락
- 조치:
  - 라우트 소스 추가: `viper/app/ops/templates/page.tsx`, `viper/app/ops/requests/page.tsx`
  - 권한 JSON 보강: `/ops/templates` GET 정책 및 `approver`의 `tasking.template.read` 스코프 반영

## 3. 프로젝트 명칭(viper) 반영

- 문서 제목/메타에 `viper` 반영:
  - `satellite_tasking_screen_spec.md`
  - `satellite_tasking_menu_ia.md`
  - `satellite_tasking_frontend_tech_spec_recommendation.md`
  - `satellite_tasking_ui_case_analysis.md`
- 권한 JSON 서비스명 반영:
  - `"service": "viper"`

## 4. 현재 정합성 상태

- 화면 정의(SCR) <-> 메뉴 IA <-> 라우트 권한 표 <-> 권한 JSON 간 기준 일치
- 실행 가이드(`VIPER_QUICK_START`)와 실제 구현 라우트(`viper/app/*`) 기준 일치
- 권한 정책 기준 파일: `viper/data/authz-matrix.json`
- Mock 데이터(`viper/data/mock/*.json`)와 화면 정의 기준 정합성 보강 완료:
  - SCR-006: `reject_reason_code`, `trace_id` 반영
  - SCR-009: `satellite_id`, `operator`, `response_code` 반영
  - SCR-010: `downlink_received_at` 반영
- SCR-003/004 mock 데이터 및 화면 반영 완료:
  - `viper/data/mock/feasibility.json`
  - `viper/data/mock/approval-history.json`
  - `/portal/feasibility/:requestId`, `/portal/quotes/:requestId`
- Mock 확장 검증 반영:
  - `ownership-violations`, `state-transition-tests`, `sla-alerts`, `security-policy-tests`, `bulk-requests`
- 화면 시나리오 실행 검증 반영:
  - `scripts/run-screen-scenarios.mjs`
  - 대상 화면: `SCR-001/002/003/004/005/006/007/008/009/010`
- 화면 데이터 호출 전환 반영:
  - `lib/mock` 직접 import -> `/api/mock/*` fetch (`lib/mock-api.ts`)
  - 전환 검증 스크립트: `scripts/verify-fetch-conversion.mjs`
  - 전환 대상 화면: `SCR-001/002/003/004/005/006/007/008/009/010`
- 남은 이슈 없음(2026-02-25 기준)

## 5. 추가 점검(2026-02-25)

- 재점검 결론: 충돌 2건 발견, 조치 완료

1. SCR-001 요청자(요약 대시보드) 누락
- 현상: `satellite_tasking_screen_spec.md`의 요약표/필수 매트릭스에서 외부요청자 SCR-001 누락
- 조치: SCR-001 주요 사용자에 `외부요청자(요약형)` 반영, 외부요청자 필수 화면에 `SCR-001(요약)` 반영

2. `/ops/requests` 조회 권한 불일치
- 현상: IA 문서는 Approver 조회 허용이지만, 구현/권한 JSON은 `PATCH` 기준(operator/admin)만 존재
- 조치:
  - `viper/data/authz-matrix.json`에 `GET /ops/requests` 정책 추가(Operator/Approver/Admin, `ops.request.read`)
  - Operator/Approver 기본 스코프에 `ops.request.read` 반영
  - `viper/app/ops/requests/page.tsx`는 화면 접근을 `GET` 기준으로 변경하고, 수정 액션은 Operator/Admin 전용으로 명시
  - `viper/data/mock/screen-scenarios.json`, `viper/scripts/run-screen-scenarios.mjs`에 `/ops/requests` 정상/비정상 시나리오 추가

- 검증 결과:
  - `pnpm build`: PASS
  - `node scripts/validate-mock-scenarios.mjs`: PASS
  - `node scripts/run-screen-scenarios.mjs`: PASS (total=24)
  - `node scripts/verify-fetch-conversion.mjs`: PASS (checked=12)

3. SCR-002 권한 표기(as-is) 명확화
- 현상: 문서 일부에 승인자/관리자의 SCR-002 권한이 구현과 다르게 표기
- 조치:
  - 승인자: `R` -> `-` (생성 화면 접근 차단)
  - 관리자: `R` -> `C/U` (운영대행 생성/수정 가능)
  - `/portal/requests/new` 허용 역할을 `Requester, Operator, Admin`으로 문서 명시

## 6. 소스-설계 정합성 재검증(2026-02-25)

- 점검 대상:
  - 설계 문서 4종: `satellite_tasking_ui_case_analysis.md`, `satellite_tasking_screen_spec.md`, `satellite_tasking_menu_ia.md`, `satellite_tasking_frontend_tech_spec_recommendation.md`
  - 구현 소스: `viper/app/*`, `viper/data/authz-matrix.json`, `viper/data/mock/*.json`, `viper/scripts/*.mjs`
- 결론: 중대 충돌 0건, 문서 표현 관점 차이 1건(의도적)

### 6.1 반영/동기화 완료 항목

1. 샘플 권한 JSON 동기화
- `satellite_tasking_authz_matrix.sample.json`에 다음 반영:
  - `ops.request.read` (operator/approver scope)
  - `tasking.order.read` (approver scope)
  - `GET /ops/requests` 정책(Operator/Approver/Admin)

2. 문서-소스 권한 기준 일치
- `SCR-002` 접근 권한: Requester/Operator/Admin, Approver 차단
- `SCR-005` Approver 조회 허용
- `SCR-007/008` 화면/목데이터/시나리오 검증 포함

### 6.2 표현 관점 차이(충돌 아님)

- `satellite_tasking_screen_spec.md`의 "사용자별 필수 화면"은 업무 책임 중심 목록
- `viper/data/authz-matrix.json`은 시스템 접근 허용 범위(RBAC) 정의
- 따라서 Admin이 다수 화면에 접근 가능하더라도, 필수 화면 표에는 운영 책임 중심으로 제한 표기될 수 있음

### 6.3 최신 검증 결과

- `pnpm build`: PASS
- `node viper/scripts/validate-mock-scenarios.mjs`: PASS
- `node viper/scripts/run-screen-scenarios.mjs`: PASS (`total=30`)
- `node viper/scripts/verify-fetch-conversion.mjs`: PASS (`checked=12`)
- `pnpm verify:mock`: PASS
- `pnpm build`: PASS

## 7. 최종 현행화 반영 목록

1. 문서 간 개념 정렬
- `SCR-003`는 요청 생성 후 `requestId` 기반 조회형 화면으로 통일
- 요청 전 검증은 `SCR-002` 입력/선호위성 검증으로 통일

2. 다중 위성 운영 정렬
- `satellites.json`(fleet), `uplink-allocation-tests.json`(정상/비정상) 반영
- `SCR-009` 화면/스크립트에서 승인/센서/상태/연락창/용량 조건 판정 반영

3. 선호 위성 지정 정렬
- `request-form-scenarios.json`에 `preferred_satellite_ids` 반영
- `SCR-002` 요청자 지정 시뮬레이션 및 유효성 검증 반영

4. 테스트/문서 정렬
- README, QUICK_START, screen spec, menu IA, ui case, tech spec 문서 동기화 완료
