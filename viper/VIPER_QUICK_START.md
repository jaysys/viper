# viper 실행 퀵 가이드

- 대상: 로컬에서 viper 프런트엔드 프로토타입 실행/검증
- 기준일: 2026-02-25

## 1) 사전 조건

- Node.js 20.9+
- pnpm 9+
- 인터넷 연결 가능 환경(최초 `pnpm install` 필요)

확인 명령:

```bash
node -v
pnpm -v
```

## 2) 실행 순서

```bash
cd /Users/jaehojoo/Desktop/codex-lgcns-workspace/viper
# fetch 기반 mock API 호출 기본값(선택)
export APP_URL=http://localhost:3000
pnpm install
pnpm dev
```

브라우저 접속:

- http://localhost:3000

## 3) 역할별 테스트 URL

- Requester
  - `http://localhost:3000/portal/dashboard?as=requester`
  - `http://localhost:3000/portal/requests/new?as=requester`
  - `http://localhost:3000/portal/requests/new?as=requester&case=FORM-OK-001&pref=SAT-EO-07,SAT-MULTI-11`
  - `http://localhost:3000/portal/requests/new?as=requester&case=FORM-ERR-AOI`
  - `http://localhost:3000/portal/orders?as=requester`
  - `http://localhost:3000/portal/orders?as=requester&status=Failed`
  - `http://localhost:3000/portal/feasibility/REQ-20260225-001?as=requester`
  - `http://localhost:3000/portal/feasibility/REQ-20260225-001?as=requester&status=LOW&case=relaxed`
  - `http://localhost:3000/portal/quotes/REQ-20260225-001?as=requester`
  - `http://localhost:3000/portal/orders/REQ-20260225-002/captures?as=requester`
  - `http://localhost:3000/portal/templates?as=requester`
- Operator
  - `http://localhost:3000/ops/dashboard?as=operator`
  - `http://localhost:3000/ops/requests?as=operator`
  - `http://localhost:3000/ops/tasking/uplink?as=operator`
  - `http://localhost:3000/ops/tasking/uplink?as=operator&request=REQ-20260225-001&satellite=SAT-MULTI-11&at=2026-02-26T01:24:00Z`
  - `http://localhost:3000/ops/tasking/reception?as=operator`
  - `http://localhost:3000/ops/templates?as=operator`
- Approver
  - `http://localhost:3000/ops/tasking/uplink?as=approver`
  - `http://localhost:3000/portal/quotes/REQ-20260225-001?as=approver`
  - `http://localhost:3000/portal/quotes/REQ-20260225-004?as=approver&status=REQUESTED&case=approver-queue`
- Admin
  - `http://localhost:3000/ops/admin?as=admin`

## 4) 정상 동작 체크포인트

- 권한 허용 시 화면 진입
- 권한 미달 시 `/forbidden`으로 리다이렉트
- `/forbidden` 화면에 `role/route/reason` 표시

## 5) 자주 발생하는 오류

1. `ERR_PNPM_META_FETCH_FAIL` 또는 `ENOTFOUND registry.npmjs.org`
- 원인: 네트워크/DNS 제한
- 조치:
  - 인터넷 연결 가능한 환경에서 다시 실행
  - 사내 프록시/사설 레지스트리 사용 시 `.npmrc` 설정 확인

2. 포트 충돌(`3000` 이미 사용 중)
- 조치:

```bash
pnpm dev -- -p 3001
```

## 6) 빌드/배포 전 확인

```bash
pnpm build
pnpm start
```

- 프로덕션 실행 URL: http://localhost:3000

## 7) 권한 정책 소스

- `data/authz-matrix.json`
- 이 파일을 기준으로 라우트 접근이 허용/차단됨

## 8) Mock 데이터 정합성 검증

```bash
cd /Users/jaehojoo/Desktop/codex-lgcns-workspace/viper
node scripts/validate-mock-scenarios.mjs
node scripts/run-screen-scenarios.mjs
node scripts/verify-fetch-conversion.mjs
node scripts/run-full-mock-verification.mjs
# 또는
pnpm verify:mock
```

검증 범위: ownership, state-transition/idempotency, SLA, security, bulk data, 다중 위성(uplink N대) 할당 정상/비정상, 요청자 선호 위성 지정 정상/비정상

## 9) Mock API 빠른 확인

```bash
curl "http://localhost:3000/api/mock/requests?status=Failed"
curl "http://localhost:3000/api/mock/feasibility/REQ-20260225-001"
curl "http://localhost:3000/api/mock/quotes/REQ-20260225-004"
curl "http://localhost:3000/api/mock/dashboard?role=approver"
curl "http://localhost:3000/api/mock/templates?scope=ORG"
curl "http://localhost:3000/api/mock/admin-config"
curl "http://localhost:3000/api/mock/satellites"
curl "http://localhost:3000/api/mock/uplink-allocation-tests"
curl "http://localhost:3000/api/mock/validate-scenarios"
```
