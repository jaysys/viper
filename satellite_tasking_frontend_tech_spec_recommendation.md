# viper 위성 촬영계획(Tasking) 프런트엔드 기술스펙 정리서

- 문서명: viper 위성 촬영계획(Tasking) 프런트엔드 기술스펙 정리서
- 프로젝트명: viper
- 버전: v0.2 (as-is 구현 상태 반영)
- 작성일: 2026-02-25
- 참조 문서:
  - `satellite_tasking_ui_case_analysis.md`
  - `satellite_tasking_screen_spec.md` (v0.3)
  - `satellite_tasking_menu_ia.md`
  - `satellite_tasking_authz_matrix.sample.json`
  - `viper/data/authz-matrix.json`

## 1. 목적

본 문서는 현재까지 조사 결과와 요구사항을 기반으로, Tasking 서비스 구현에 적합한 프런트엔드 기술스펙 권장안을 정리한다.

## 2. 조사 범위 및 한계

- 조사 대상은 Planet, Maxar, Airbus, ICEYE, Capella의 공개 문서(기능/API/운영 흐름)이다.
- 공개 문서에서는 일반적으로 실제 제품 프런트엔드 구현 스택(React/Angular/Vue 등)을 공개하지 않는다.
- 따라서 본 권장안은 "경쟁사 스택 추종"이 아니라 "요구사항 적합성" 기준으로 도출한다.

## 3. 현재 요구사항 요약

- 지도 기반 AOI 입력(점/선/폴리곤) 및 검증
- 촬영요청 위저드, 타당성/성공확률, 견적/승인, 모니터링, 검수
- 사용자 유형 분리: 외부요청자/내부운영자/승인자/관리자
- 내부운영 필수 화면: 작전지시(Uplink), 수신·처리·QA 모니터링
- 라우트/버튼 단위 권한 제어 및 감사로그 연계
- 백엔드 이전 단계에서도 UI 시각 검증 가능한 개발 방식 필요

## 4. 구현 상태(as-is)

## 4.1 코어 스택

- 언어: TypeScript
- UI 라이브러리: React 19
- 프레임워크: Next.js 16 (App Router)
- 패키지 매니저: pnpm

## 4.2 데이터/검증 구조

- 화면 데이터: `/api/mock/*` fetch 기반
- 권한 정책: `viper/data/authz-matrix.json`
- 검증 스크립트:
  - `validate-mock-scenarios.mjs`
  - `run-screen-scenarios.mjs`
  - `verify-fetch-conversion.mjs`
  - `run-full-mock-verification.mjs`

## 4.3 현재 구현된 핵심 범위

- SCR-001~SCR-010 전체 화면
- 실사 기반 캡처 mock 이미지(로컬 자산)
- 다중 위성 fleet(N대) + uplink allocation 정상/비정상 케이스
- 요청자 선호 위성 지정(SCR-002), 운영자 재할당 시뮬레이터(SCR-009)

## 5. 권장 기술스펙(phase-2)

## 5.1 코어 스택(유지)

- 언어: TypeScript
- UI 라이브러리: React
- 프레임워크: Next.js (App Router 기반)
- 패키지 매니저: pnpm

## 5.2 상태/폼/검증(확장 권장)

- 서버 상태 관리: TanStack Query
- 폼 상태 관리: React Hook Form
- 스키마 검증: Zod

## 5.3 지도/시각화(확장 권장)

- 지도 엔진: MapLibre GL JS
- 사용 목적: AOI 드로잉, 오버레이 상태표시, 작전 모니터링 지도

## 5.4 UI 컴포넌트 및 테스트(확장 권장)

- 컴포넌트 시스템: MUI
- E2E 테스트: Playwright

## 6. 권장 근거(요구사항 적합성)

- 멀티 역할 UI: Next.js 라우팅 + 권한 가드로 Portal/Ops 분리 용이
- 빠른 화면 생산성: MUI 기반으로 관리형 화면(Table/Form/Dialog) 구현 속도 확보
- 복잡 폼 대응: React Hook Form + Zod로 위저드 입력과 검증 로직 안정화
- 지도 중심 업무: MapLibre로 AOI/상태 시각화를 OSS 중심으로 구성 가능
- 운영 안정성: Playwright로 역할별 라우팅/권한 시나리오 자동 검증 가능
- Mock 기반 선개발: `viper/data/authz-matrix.json`(기준)과 결합해 백엔드 없이 UI 검증 가능

## 7. 백엔드 없이 가능한 선검증 범위

- 역할별 메뉴 노출/비노출 검증
- 라우트 접근 차단(403 UX) 검증
- 버튼 단위 권한(enable/disable) 검증
- 상태별 화면 전이 및 운영 흐름 데모
- 다중 위성 할당/재할당 시나리오 데모

제약:
- 보안 강제는 최종적으로 API 백엔드 인가에서 수행되어야 함
- 본 단계 검증은 UX/동선/화면 일관성 검증 목적

## 8. 구현 시작 기준(초기)

- 단일 모노레포 또는 단일 앱에서 `Portal`/`Ops` 경로 분리
- 권한 소스: `viper/data/authz-matrix.json` (기준), `satellite_tasking_authz_matrix.sample.json` (루트 샘플)
- 프론트 가드 순서: `authGuard -> areaGuard -> roleGuard`
- 고위험 화면(SCR-009/010/008): 내부망/VPN/MFA 정책 전제

## 9. 결정사항 요약

- 본 프로젝트 프런트엔드 권장안은 "요구사항 충족형"으로 채택
- 경쟁사 공개문서상 구현 스택 미공개를 명시적으로 인정
- 문서/화면/IA/권한정책 산출물 간 추적 가능 구조 유지

## 10. 다음 단계

- 권장 스택 기준 프로젝트 초기 구조 수립
- 권한 JSON을 사용하는 Mock Auth/Route Guard 기본 구현
- SCR-002/005/009/010 우선 화면 프로토타입 제작
