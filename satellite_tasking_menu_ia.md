# viper 위성 촬영계획(Tasking) 사용자별 메뉴 IA 정의서

- 문서명: viper 위성 촬영계획(Tasking) 사용자별 메뉴 IA 정의서
- 프로젝트명: viper
- 버전: v0.2 (다중위성/선호위성 반영)
- 기준일: 2026-02-25
- 참조 문서: `satellite_tasking_screen_spec.md` (v0.3)

## 1. 목적

본 문서는 사용자 유형별로 필요한 메뉴 구조(IA)와 접근 정책을 정의한다.

- 외부요청자와 내부운영자 화면을 명확히 분리
- 역할별 접근 경로 표준화
- 화면 정의서(SCR-xxx)와 1:1 추적 가능하도록 설계

## 2. 사용자 영역 분리 원칙

- `외부 포털(Portal)`: 외부요청자 중심 업무
- `내부 운영콘솔(Ops Console)`: 내부운영자/승인자/관리자 중심 업무
- 고위험 화면(SCR-009, SCR-010, SCR-008)은 운영콘솔에서만 제공

## 3. 메뉴 트리

## 3.1 외부 포털(Portal)

- 홈
- 내 현황 대시보드 (SCR-001 요약형 또는 전용 뷰)
- 촬영 요청
- 촬영요청 생성 (SCR-002)
- 타당성/성공확률 확인 (SCR-003)
- 견적/승인 요청 (SCR-004 조회/요청)
- 진행 조회
- 주문/작전 모니터링 (SCR-005 조회)
- 요청 상세/결과 확인 (SCR-006 조회)
- 재사용
- 템플릿/복제 (SCR-007)
- 알림/연동
- 알림 설정 (Email/Webhook)

## 3.2 내부 운영콘솔(Ops Console)

- 운영 대시보드
- 통합 운영 대시보드 (SCR-001)
- 요청 운영
- 촬영요청 생성/수정 (SCR-002)
- 타당성 분석 (SCR-003)
- 견적/승인 처리 (SCR-004)
- 주문/작전 모니터링 (SCR-005)
- 요청 상세/캡처 검수 (SCR-006)
- 위성 작전
- 작전지시(Uplink) (SCR-009)
- 수신·처리·QA 모니터링 (SCR-010)
- 재처리/재촬영 큐 (SCR-006, SCR-010 연계)
- 운영 설정
- 템플릿 관리 (SCR-007)
- 관리자 설정 (SCR-008)

## 4. 사용자별 메뉴 접근 매트릭스

| 메뉴/화면 | 외부요청자 | 내부운영자 | 승인자 | 시스템관리자 |
|---|---|---|---|---|
| SCR-001 대시보드 | R(요약형) | R | R | R |
| SCR-002 촬영요청 생성 | C/U | C/U | - | C/U |
| SCR-003 타당성·성공확률 | R | R | R | R |
| SCR-004 견적·승인 | R(요청/조회) | R | A | R/A |
| SCR-005 주문/작전 모니터링 | R | R/U | R | R |
| SCR-006 요청상세·검수 | R(조회) | C/U | R | R |
| SCR-007 템플릿·재사용 | C/U | C/U | R | R |
| SCR-008 관리자 설정 | - | - | - | C/U/D |
| SCR-009 작전지시(Uplink) | - | C/U | R | R |
| SCR-010 수신·처리·QA | - | R/U | R | R |

- 권한 표기: `R` 조회, `C` 생성, `U` 수정, `D` 삭제, `A` 승인

## 5. 내비게이션 규칙

- 외부 포털에서는 내부 운영 메뉴(SCR-009/010/008) 노출 금지
- 승인자는 승인 대기 건 진입을 최상위 메뉴로 고정
- 내부운영자는 `작전지시(SCR-009)`와 `수신·QA(SCR-010)`를 동일 깊이 메뉴로 배치
- 상태 기반 딥링크 제공: SCR-005에서 SCR-009/010/006으로 직접 이동

## 6. URL/라우팅 권장안

- Portal
- `/portal/dashboard`
- `/portal/requests/new` (SCR-002)
- `/portal/feasibility/:requestId` (SCR-003)
- `/portal/quotes/:requestId` (SCR-004)
- `/portal/orders` (SCR-005)
- `/portal/orders/:requestId/captures` (SCR-006)
- `/portal/templates` (SCR-007)

- Ops Console
- `/ops/dashboard` (SCR-001)
- `/ops/requests` (SCR-002/003/004/005/006)
- `/ops/tasking/uplink` (SCR-009)
- `/ops/tasking/reception` (SCR-010)
- `/ops/templates` (SCR-007)
- `/ops/admin` (SCR-008)

## 7. 운영/보안 정책

- SCR-009/010/008은 내부망 또는 VPN + MFA 필수
- 승인/지시/QA 액션은 전부 감사로그 기록
- 외부요청자 세션으로 운영콘솔 URL 접근 시 403 + 경고로그 기록

## 8. 다음 단계

- 사용자별 실제 메뉴 와이어프레임 작성
- 화면별 Breadcrumb/탭 구조 확정
- 라우팅 권한 가드(Frontend + API) 구현 명세 연결

## 9. 메뉴 와이어 텍스트(1depth/2depth)

### 9.1 외부요청자 Portal

```text
[1D] 대시보드
  [2D] 내 현황
  [2D] 알림센터

[1D] 촬영요청
  [2D] 요청 생성 (SCR-002)
  [2D] 타당성 검토 (SCR-003)
  [2D] 견적/승인 요청 (SCR-004)

[1D] 진행조회
  [2D] 주문/작전 현황 (SCR-005)
  [2D] 요청 상세/결과 (SCR-006)

[1D] 템플릿
  [2D] 내 템플릿 (SCR-007)
  [2D] 템플릿으로 생성 (SCR-007)
```

### 9.2 내부운영자 Ops Console

```text
[1D] 운영대시보드
  [2D] 통합 대시보드 (SCR-001)
  [2D] 예외/지연 알림

[1D] 요청운영
  [2D] 요청 접수/수정 (SCR-002)
  [2D] 타당성 분석 (SCR-003)
  [2D] 견적/승인 연계 (SCR-004)
  [2D] 주문/작전 모니터링 (SCR-005)
  [2D] 요청 상세/검수 (SCR-006)

[1D] 위성작전
  [2D] 작전지시(Uplink) (SCR-009)
  [2D] 수신·처리·QA (SCR-010)
  [2D] 재처리/재촬영 큐 (SCR-006, SCR-010)

[1D] 운영설정
  [2D] 템플릿 관리 (SCR-007)
```

### 9.3 승인자 Approver 전용 메뉴 뷰

```text
[1D] 승인대기함
  [2D] 예산초과 대기건 (SCR-004)
  [2D] 긴급건 승인요청 (SCR-004)

[1D] 운영현황
  [2D] 승인 후 진행현황 (SCR-005)
  [2D] 실패/지연 리포트 (SCR-001, SCR-005)
```

### 9.4 시스템관리자 Admin 전용 메뉴 뷰

```text
[1D] 관리자설정
  [2D] 사용자/권한(RBAC) (SCR-008)
  [2D] 계약/쿼터/크레딧 (SCR-008)
  [2D] 전달/알림 정책 (SCR-008)
  [2D] 감사로그 조회 (SCR-008)
```

### 9.5 노출 제어 규칙

- 외부요청자: `위성작전`, `관리자설정` 1depth 자체 비노출
- 내부운영자: `관리자설정` 비노출, `운영설정`만 노출
- 승인자: `요청운영` 직접수정 메뉴 비노출, 승인 중심 메뉴만 노출
- 시스템관리자: 모든 메뉴 조회 가능, 설정 변경은 SCR-008에서만 수행

## 10. 라우트 권한 매핑표(프론트/API)

## 10.1 공통 권한 가드 규칙

- 인증 가드: 미인증 사용자는 모든 `/portal/*`, `/ops/*` 접근 차단(로그인 리다이렉트)
- 영역 가드: 외부요청자는 `/ops/*` 접근 차단(403), 내부역할은 `/portal/*` 접근 가능 여부 정책 선택
- 역할 가드: 라우트별 허용 역할 외 접근 차단(403)
- 액션 가드: 화면 접근 가능해도 `생성/수정/승인/삭제`는 API 권한에서 최종 차단

## 10.2 라우트별 권한 매핑

| 영역 | Route | 화면 | 프론트 허용 역할 | API 권한(최소) | 실패 응답 |
|---|---|---|---|---|---|
| Portal | `/portal/dashboard` | SCR-001(요약) | Requester, Operator, Approver, Admin | `tasking.read` | 401/403 |
| Portal | `/portal/requests/new` | SCR-002 | Requester, Operator, Admin | `tasking.request.create` | 401/403 |
| Portal | `/portal/feasibility/:requestId` | SCR-003(요청 후 타당성 조회) | Requester, Operator, Approver, Admin | `tasking.feasibility.read` | 401/403 |
| Portal | `/portal/quotes/:requestId` | SCR-004 | Requester, Operator, Approver, Admin | `tasking.quote.read`, 승인 시 `tasking.quote.approve` | 401/403 |
| Portal | `/portal/orders` | SCR-005 | Requester, Operator, Approver, Admin | `tasking.order.read` | 401/403 |
| Portal | `/portal/orders/:requestId/captures` | SCR-006 | Requester, Operator, Approver, Admin | `tasking.capture.read`, 검수수정 시 `tasking.capture.review` | 401/403 |
| Portal | `/portal/templates` | SCR-007 | Requester, Operator, Approver, Admin | `tasking.template.read`, 생성/수정 시 `tasking.template.write` | 401/403 |
| Ops | `/ops/dashboard` | SCR-001 | Operator, Approver, Admin | `ops.dashboard.read` | 401/403 |
| Ops | `/ops/requests` | SCR-002~006 | Operator, Approver, Admin | `ops.request.read`, 수정 시 `ops.request.write` | 401/403 |
| Ops | `/ops/tasking/uplink` | SCR-009(다중위성 재할당 포함) | Operator, Approver, Admin | 조회 `ops.uplink.read`, 지시 `ops.uplink.execute` | 401/403 |
| Ops | `/ops/tasking/reception` | SCR-010 | Operator, Approver, Admin | `ops.reception.read`, 조치 시 `ops.reception.write` | 401/403 |
| Ops | `/ops/templates` | SCR-007 | Operator, Approver, Admin | `tasking.template.read`, 수정 시 `tasking.template.write` | 401/403 |
| Ops | `/ops/admin` | SCR-008 | Admin | `ops.admin.manage` | 401/403 |

## 10.3 API 권한 스코프 제안

- 조회 계열: `*.read`
- 변경 계열: `*.write`
- 승인 계열: `*.approve`
- 실행 계열(지시/재처리): `*.execute`
- 관리자 계열: `*.manage`

예시:
- Requester 기본 스코프: `tasking.read`, `tasking.request.create`, `tasking.feasibility.read`, `tasking.quote.read`, `tasking.order.read`, `tasking.capture.read`, `tasking.template.read`, `tasking.template.write`
- Operator 기본 스코프: Requester + `ops.dashboard.read`, `ops.request.read`, `ops.request.write`, `tasking.capture.review`, `ops.uplink.read`, `ops.uplink.execute`, `ops.reception.read`, `ops.reception.write`
- Approver 기본 스코프: `tasking.read`, `tasking.quote.read`, `tasking.order.read`, `tasking.quote.approve`, `ops.dashboard.read`, `ops.request.read`, `ops.uplink.read`, `ops.reception.read`, `tasking.template.read`
- Admin 기본 스코프: `*` 또는 도메인별 `*.manage`

## 10.5 구현 기준 쿼리 시뮬레이션

- 요청자 선호 위성 지정(SCR-002):
  - `/portal/requests/new?as=requester&case=FORM-OK-001&pref=SAT-EO-07,SAT-MULTI-11`
- 운영자 재할당 시뮬레이션(SCR-009):
  - `/ops/tasking/uplink?as=operator&request=REQ-20260225-001&satellite=SAT-MULTI-11&at=2026-02-26T01:24:00Z`

참고:
- `SCR-003`는 요청 생성 후 `requestId` 기준 백엔드 산출결과를 조회하는 화면이며, 요청 전 프리체크 전용 화면은 별도 범위다.

## 10.4 구현 체크리스트

- 프론트 라우터에서 `authGuard -> areaGuard -> roleGuard` 순서 적용
- API에서 리소스 소유권 검증(외부요청자는 본인 요청건만 조회 가능)
- 승인/지시/QA 변경 API는 감사로그 필수 기록
- 403 응답 시 표준 에러코드 반환: `ERR_AUTH_FORBIDDEN_ROLE`, `ERR_AUTH_FORBIDDEN_SCOPE`

참조 샘플:
- `satellite_tasking_authz_matrix.sample.json` (백엔드 인가 정책 초기 템플릿)
- `viper/data/authz-matrix.json` (viper 프런트엔드 구현 기준 파일)
