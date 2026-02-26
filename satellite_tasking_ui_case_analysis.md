아래는 2025~2026년 공개 문서 기준으로 본 `viper` 프로젝트(위성 촬영계획 Tasking 시스템) 화면 구성 제안이며, 2026-02-25 현재 구현 상태(as-is) 메모를 함께 포함한다.

**사례 분석 요약**
| 공통 패턴 | 확인된 사례 |
|---|---|
| 지도 기반 AOI 지정(점/선/폴리곤) + 크기/형상 제약 | Planet, Maxar, Airbus, ICEYE, Capella |
| 촬영 시간창(TOI/Window open-close) 설정 | Planet, ICEYE, Capella, Maxar |
| 촬영 제약조건 설정(EO: cloud/off-nadir/azimuth, SAR: incidence/look side/pass direction) | Maxar, Planet, ICEYE, Capella |
| 사전 타당성(Feasibility) 또는 성공확률 확인 | Maxar, Airbus, ICEYE |
| 견적/비용/승인 및 취소 정책 반영 | Planet, Capella, Airbus |
| 주문 진행상태 모니터링(테이블+지도+상세 이력) | Planet, Maxar |
| 산출물 전달설정(클라우드/SFTP) + 알림 | Planet, ICEYE, Airbus |

**권장 화면 구성(기본 8 + 내부운영 2)**
1. `대시보드`
- 금일 요청 수, 진행/완료/실패, 평균 리드타임, 긴급건, 만료 임박건.
- 지도 오버레이로 AOI 분포와 상태 색상.

2. `촬영요청 생성(위저드)`
- 기본정보: 요청명, 우선순위, 센서/상품유형(EO/SAR), 단일/반복촬영.
- AOI: 점/선/폴리곤 작성, 면적/폭/vertex 자동 검증.
- 시간: 촬영 시작-종료, 타임존, 반복주기.
- 제약조건: EO(구름량, off-nadir, azimuth), SAR(incidence, look side, ascending/descending).
- 산출물: 해상도/밴드/처리레벨/포맷/압축/전달위치.
- 알림: 이메일/Webhook/운영자 지정.

3. `타당성·성공확률 화면`
- 시간창별 성공확률(높음/중간/낮음), 대체 시간 제안.
- 제약조건 완화 시뮬레이션(예: cloud 15→25%).
- as-is: 요청 후 `requestId` 기반 조회형으로 구현(백엔드 산출결과 조회).

4. `견적·승인 화면`
- 예상비용, 과금 단위, SLA 옵션별 비용 변화.
- 취소/변경 가능 시점 및 패널티 명시.
- 승인 워크플로우(요청자-검토자-승인자).

5. `주문/작전 모니터링 화면`
- 테이블/지도 전환, 상태/기간/AOI 필터.
- 상태 타임라인(접수→배정→촬영→처리→전달→종료).
- 부분충족/미충족 사유 및 잔여 커버리지.

6. `요청 상세·캡처 검수 화면`
- 캡처별 품질평가, 반려/재검토 요청, 재촬영 요청.
- 전달 이력/재전달 버튼, 다운로드 링크 관리.

7. `템플릿·재사용 화면` (권장)
- 기존 요청 복제, 템플릿 저장/버전관리.

8. `관리자 설정 화면` (권장)
- 계약/쿼터/크레딧, 사용자 권한, 기본 전달 경로, 감사로그.

9. `작전지시(Uplink) 화면` (내부운영 필수)
- 승인 완료 건에 대해 실제 위성 지시 생성/전송 실행.
- 지시생성 -> 큐등록 -> Uplink 요청 -> 응답(ACK/실패) 확인.
- as-is: 다중 위성(N대) 기준 재할당 시뮬레이션(요청/위성/시각 선택, ALLOW/DENY 사유) 구현.

10. `수신·처리·QA 모니터링 화면` (내부운영 필수)
- downlink 수신 확인, checksum/파이프라인/QA 상태 관리.
- QA Fail 또는 checksum mismatch 시 납품 차단 및 재검토 연계.

**운영상 꼭 넣어야 할 검증 로직**
- AOI 제약 검증(최소/최대 면적, 폭, vertex).
- 시간 제약 검증(최소 lead time, 최소 window 길이, 최대 미래일).
- 상품별 파라미터 호환성 검증(예: 모드별 각도/밴드 제한).
- 취소/변경 가능 여부 실시간 판정.
- 선호 위성 지정 검증(최대 3개, 센서 일치, 정비중 제외, 유효 후보 존재).
- 다중 위성 할당 검증(승인상태, 센서, 위성상태, contact window, 일일 capacity).

**현재 구현 현황(2026-02-25)**
- 화면: SCR-001~SCR-010 전부 구현(권장 화면 포함)
- 시나리오: 정상/비정상 총 30건 자동 검증 통과
- 목데이터: 실사 캡처 이미지 + 다중위성 fleet + uplink allocation test 포함

`추론`  
위 화면 IA는 각 벤더 문서의 공통 기능을 합쳐 “플랫폼 독립적 운영 시스템”으로 재구성한 것입니다.

**참고 소스**
- Planet Create Tasking Orders: https://docs.planet.com/platform/get-started/access-data/task-imagery/create_orders/
- Planet Manage Tasking Orders: https://docs.planet.com/platform/get-started/access-data/task-imagery/manage_orders/
- Maxar Tasking UI 가이드: https://pro-docs.maxar.com/en-us/Tasking/Tasking_requests.htm
- Maxar Tasking API 개요: https://developers.maxar.com/docs/tasking/
- Airbus OneAtlas Tasking: https://api.oneatlas.airbus.com/guides/oneatlas-data/g-tasking/
- ICEYE Create Task: https://docs.iceye.com/constellation/api/tasking/create-task/
- Capella Tasking Parameters: https://support.capellaspace.com/what-are-capellas-tasking-parameters

이 구성을 기준으로 `업무화면 IA(메뉴 트리) + 화면별 필드 정의서` 작성함!
