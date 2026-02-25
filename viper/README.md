# viper

Next.js 기반의 viper 프런트엔드 프로토타입입니다.

## 목적

- 문서(`screen spec`, `menu IA`, `authz json`) 기준으로 역할별 접근 제어 UI를 빠르게 시각 검증
- 백엔드 없이도 `?as=<role>`로 권한 시나리오 확인

## 실행

```bash
pnpm install
pnpm dev
```

## 역할 전환 예시

- `/portal/dashboard?as=requester`
- `/portal/requests/new?as=requester`
- `/portal/requests/new?as=requester&case=FORM-OK-001&pref=SAT-EO-07,SAT-MULTI-11`
- `/portal/requests/new?as=requester&case=FORM-ERR-LEAD`
- `/portal/orders?as=requester`
- `/portal/orders?as=requester&status=Failed`
- `/portal/feasibility/REQ-20260225-001?as=requester`
- `/portal/feasibility/REQ-20260225-001?as=requester&status=LOW&case=relaxed`
- `/portal/quotes/REQ-20260225-001?as=approver`
- `/portal/quotes/REQ-20260225-004?as=approver&status=REQUESTED&case=approver-queue`
- `/portal/orders/REQ-20260225-002/captures?as=requester`
- `/portal/templates?as=requester`
- `/ops/dashboard?as=operator`
- `/ops/requests?as=operator`
- `/ops/tasking/uplink?as=approver`
- `/ops/tasking/uplink?as=operator&request=REQ-20260225-001&satellite=SAT-MULTI-11&at=2026-02-26T01:24:00Z`
- `/ops/tasking/reception?as=admin`
- `/ops/templates?as=operator`
- `/ops/admin?as=admin`

## 권한 소스

- `data/authz-matrix.json` (root 샘플에서 복사)

## 와이어 검증용 Mock 데이터

- `data/mock/requests.json`
- `data/mock/quotes.json`
- `data/mock/timelines.json`
- `data/mock/captures.json`
- `data/mock/validation-rules.json`
- `data/mock/uplink-jobs.json`
- `data/mock/satellites.json`
- `data/mock/uplink-allocation-tests.json`
- `data/mock/reception-jobs.json`
- `data/mock/request-form-scenarios.json`
- `data/mock/feasibility.json`
- `data/mock/approval-history.json`
- `data/mock/ownership-violations.json`
- `data/mock/state-transition-tests.json`
- `data/mock/sla-alerts.json`
- `data/mock/security-policy-tests.json`
- `data/mock/bulk-requests.json`
- `data/mock/dashboard.json`
- `data/mock/templates.json`
- `data/mock/admin-config.json`

## 캡처 실사 Mock 이미지

- 경로: `public/mock-images/real-scenes/*`
- 메타 필드: `capture_mode`, `sensor_type`, `acquired_at` (썸네일 하단 오버레이 및 확대 모달에 표시)
- 사용 파일:
  - `scene-urban-city.jpg` (Satellite image of France in August 2002)
  - `scene-harbor.jpg` (Astronaut photograph - Pearl Harbor, Hawaii)
  - `scene-flood.jpg` (Flooding in Pakistan - NASA satellite imagery)
  - `scene-wildfire.jpg` (Greece wildfire monitoring from space)
  - `scene-farmland.jpg` (Mojave Desert / San Joaquin Valley satellite image)
- 라이선스: Wikimedia Commons 공개 라이선스(출처 표기 기반)

## Mock 검증 스크립트

```bash
node scripts/validate-mock-scenarios.mjs
node scripts/run-screen-scenarios.mjs
node scripts/verify-fetch-conversion.mjs
node scripts/run-full-mock-verification.mjs
```

## Mock API 엔드포인트

- `GET /api/mock/requests?status=ALL|Approved|Tasked|Failed`
- `GET /api/mock/requests/:requestId`
- `GET /api/mock/form-scenarios`
- `GET /api/mock/validation-rules`
- `GET /api/mock/timelines/:requestId`
- `GET /api/mock/feasibility`
- `GET /api/mock/feasibility/:requestId`
- `GET /api/mock/quotes?status=ALL|REQUESTED|APPROVED|REJECTED`
- `GET /api/mock/quotes/:requestId`
- `GET /api/mock/approval-history/:requestId`
- `GET /api/mock/captures/:requestId`
- `GET /api/mock/uplink`
- `GET /api/mock/satellites`
- `GET /api/mock/uplink-allocation-tests`
- `GET /api/mock/reception`
- `GET /api/mock/dashboard?role=requester|operator|approver|admin`
- `GET /api/mock/templates?scope=ALL|PERSONAL|ORG`
- `GET /api/mock/admin-config`
- `GET /api/mock/validate-scenarios`

## 구현 메모

- 페이지 서버 렌더 단계에서 `requireRouteAccess()`로 권한 미달 시 `/forbidden` 리다이렉트
- `?as=<role>` 쿼리로 역할을 강제해 화면/권한 UI를 빠르게 검증 가능
- `SCR-009`는 위성 풀(N대) 기준으로 승인상태/센서적합/가용연락창/일일용량/상태를 함께 판정
- `SCR-002`는 요청자 선호 위성(`preferred_satellite_ids`) 지정 시나리오를 검증
- `SCR-009`는 운영자 재할당 시뮬레이터로 요청/위성/시각 조합별 ALLOW/DENY를 확인
