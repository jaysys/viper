# viper 위성 촬영계획(Tasking) 타사 참고 UI 이미지 갤러리

- 문서명: viper 위성 촬영계획(Tasking) 타사 참고 UI 이미지 갤러리
- 프로젝트명: viper
- 기준일: 2026-02-26
- 목적: `satellite_tasking_ui_case_analysis.md`에서 참고한 소스 링크의 실제 화면을 카테고리별로 정리

## 1. 촬영요청 생성/입력(Task Creation)

### 1.1 Planet - Create Tasking Orders
- 소스: https://docs.planet.com/platform/get-started/access-data/task-imagery/create_orders/
- 분류: 요청 생성(요청 입력/파라미터 구성)

![Planet Create Tasking Orders](https://image.thum.io/get/width/1400/noanimate/https://docs.planet.com/platform/get-started/access-data/task-imagery/create_orders/)

### 1.2 ICEYE - Create Task
- 소스: https://docs.iceye.com/constellation/api/tasking/create-task/
- 분류: 요청 생성(API 기반 Task 생성)

![ICEYE Create Task](https://image.thum.io/get/width/1400/noanimate/https://docs.iceye.com/constellation/api/tasking/create-task/)

## 2. 주문/작전 모니터링(Order Management / Monitoring)

### 2.1 Planet - Manage Tasking Orders
- 소스: https://docs.planet.com/platform/get-started/access-data/task-imagery/manage_orders/
- 분류: 주문/작전 모니터링(상태/이력 관리)

![Planet Manage Tasking Orders](https://image.thum.io/get/width/1400/noanimate/https://docs.planet.com/platform/get-started/access-data/task-imagery/manage_orders/)

## 3. 타당성/요청정의/파라미터 참고(Feasibility / Parameter)

### 3.1 Maxar - Tasking Requests
- 소스: https://pro-docs.maxar.com/en-us/Tasking/Tasking_requests.htm
- 분류: 타당성/요청정의 참고

![Maxar Tasking Requests](https://image.thum.io/get/width/1400/noanimate/https://pro-docs.maxar.com/en-us/Tasking/Tasking_requests.htm)

### 3.2 Airbus OneAtlas - Tasking Guide
- 소스: https://api.oneatlas.airbus.com/guides/oneatlas-data/g-tasking/
- 분류: 타당성/요청정의 참고

![Airbus OneAtlas Tasking](https://image.thum.io/get/width/1400/noanimate/https://api.oneatlas.airbus.com/guides/oneatlas-data/g-tasking/)

### 3.3 Capella - Tasking Parameters
- 소스: https://support.capellaspace.com/what-are-capellas-tasking-parameters
- 분류: 파라미터 정의 참고

![Capella Tasking Parameters](https://image.thum.io/get/width/1400/noanimate/https://support.capellaspace.com/what-are-capellas-tasking-parameters)

## 4. 활용 메모(viper 매핑)

- `SCR-002 촬영요청 생성`: Planet/ICEYE 요청 생성 화면 패턴 참조
- `SCR-003 타당성`: Maxar/Airbus 요청정의 및 feasibility 정보 구성 참조
- `SCR-005 주문 모니터링`: Planet 관리 화면 패턴 참조
- `SCR-009/010 내부운영`: 타사 공개문서의 운영 흐름(요청->지시->수신)을 viper 운영 콘솔 형태로 재구성

## 5. 주의사항

- 본 문서 이미지는 각 링크 페이지를 스냅샷한 참조용 캡처다.
- 원본 화면 저작권/정책은 각 서비스 제공사의 이용약관을 따른다.
