# 개발창 전달용 프롬프트 + Task Scope 분할

작성일: 2026-04-17  
목적: 개발창에 바로 붙여넣을 수 있는 실행 프롬프트를 제공하고, 범위 팽창 없이 역할별 책임 경계를 고정한다.

## 1) 개발창 공통 마스터 프롬프트 (복붙용)

```text
너는 로스트아크 데이터/지표 통합 사이트의 개발 담당이다.

[고정 전제]
- 기능 많은 포털이 아니라 "원정대 CFO형 운영 허브"를 만든다.
- 원정대 기준으로 스펙, 숙제, 시장, 투자 우선순위를 한 화면에서 연결한다.
- 저비용 MVP로 빠르게 검증한다.

[MVP 포함]
1) 원정대 통합 대시보드
2) 설명 가능한 스펙업 ROI 카드(v0, 규칙 기반)
3) 저장 목록 + 변경 추적 중심 검색 경험

[MVP 제외]
- 공개 랭킹 전면전
- 독립형 지도/DB
- 독립형 돌/재련/유각 계산기
- 대형 커뮤니티 게시판
- 스트리머 허브
- 완전 자동 협업형 공대 운영
- 정교한 실시간 시세 포털

[핵심 페이지]
- / (홈/검색 랜딩)
- /expedition/:name (원정대 통합 결과, 주 라우트)
- /character/:name (캐릭터 보조 라우트)
- /weekly/:name (원정대 운영/주간 보조)

[필수 API]
- GET /api/home
- GET /api/character/:name
- GET /api/expedition/:name
- GET /api/weekly/:name
- GET /api/saved

[공통 응답 메타 필드]
success, source, fetchedAt, cachedAt, stale, partial, warnings

[절대 규칙]
1. 프론트는 외부 데이터 소스를 직접 알지 않는다.
2. 백엔드는 외부 응답을 내부 표준 스키마로 정규화한다.
3. 실패 시 전체 실패보다 부분 성공(partial) 응답을 우선한다.
4. mock -> 실제 데이터 연결 순서로 진행한다.
5. 문서 없는 기능은 구현하지 말고 backlog로 분리한다.

[이번 작업 목표]
- 사용자 시나리오 기준으로 MVP를 구현 가능한 단위로 나눠 개발한다.
- 상태 정의(loading/empty/error/partial)를 모든 핵심 페이지에 반영한다.
- 범위 추가 없이 완료 기준을 충족한다.

[완료 보고 형식]
1) 구현 범위
2) API/상태 처리 반영 내용
3) 테스트 결과
4) 미완료 항목과 이유
```

## 2) 역할별 Task Scope

### A. Frontend Scope

#### 담당 범위
- `/`, `/expedition/:name`, `/character/:name`, `/weekly/:name` 화면 구성
- 검색 -> 통합 결과 -> 주간 보조 이동 흐름
- 저장 목록/변경 이벤트 UI 노출
- ROI 카드 렌더링 + 근거/신뢰도 표시
- `loading/empty/error/partial` 상태 구현

#### 제외 범위
- 외부 API 직접 호출
- ROI 계산 로직 구현
- 실시간 시세 엔진 구축

#### 완료 기준
- 핵심 3개 시나리오 UI 경로가 끊김 없이 동작
- partial/warnings 상태가 사용자에게 명확히 보임
- 저장 목록/변경 이벤트를 홈과 통합결과에서 확인 가능

### B. Backend Scope

#### 담당 범위
- 5개 API 엔드포인트 구현
- 공통 메타 필드 강제
- 데이터 정규화 계층 구현 (source 은닉)
- partial/warnings 규칙 적용
- ROI Engine v0 규칙 서비스 제공

#### 제외 범위
- FE 화면 로직
- 고도화 ML 추천
- 실시간 초저지연 시세 집계

#### 완료 기준
- 5개 API가 계약 스키마를 일관되게 반환
- 누락/실패 케이스에서 partial 응답 정상 반환
- source/fetchedAt/cachedAt/stale 값이 디버깅 가능 수준으로 제공

### C. Data Collection Scope

#### 담당 범위
- 공식 소스 우선 연동 검증
- 필드 매핑 및 정규화 입력 생성
- 캐시 키/TTL 정책 적용
- 소스 실패 시 fallback 데이터 흐름 설계

#### 제외 범위
- 클라이언트 직접 크롤링
- 대규모 실시간 크롤링 인프라

#### 완료 기준
- character/expedition/weekly 데이터가 안정적으로 수집
- stale/partial 판단을 위한 최소 메타 확보
- 소스 장애 시 전체 API 다운 없이 제한 기능 제공

### D. QA Scope

#### 담당 범위
- 핵심 시나리오 3개 E2E
- 상태값(loading/empty/error/partial/stale) 검증
- 저장/변경추적 회귀 테스트

#### 완료 기준
- 시나리오별 통과/실패 근거 기록
- 장애/결측 상황에서 사용자 안내 메시지 확인
- Non-goal 기능이 섞여 들어오지 않았는지 확인

### E. PM/Docs Scope

#### 담당 범위
- API 계약서 고정
- Non-goal 및 변경요청 backlog 관리
- 스프린트별 완료 기준 정의/점검

#### 완료 기준
- 문서와 구현 범위가 일치
- 범위 변경은 backlog와 근거가 남음

## 3) Sprint별 작업 분할 (2주 단위)

### Sprint 1 (주 1~2)
- Frontend: 홈 + 통합결과 기본 골격, 상태 4종 반영
- Backend: 5개 API mock + 공통 메타 필드
- Data: 소스 검증 체크리스트 + 캐시 정책 초안
- Docs: API Contract v1 + 상태 매트릭스
- QA: 시나리오 테스트케이스 초안

### Sprint 2 (주 3~4)
- Frontend: 원정대 운영/주간 보조 + 저장/변경추적 UI
- Backend: 실데이터 연결 + partial/warnings + ROI Engine v0
- Data: 정규화 매핑 + fallback 처리
- Docs: ROI 규칙표 + 의사결정 로그
- QA: 핵심 시나리오 E2E 1차

### Sprint 3 (주 5~6)
- Frontend: UX 정리(설명/신뢰도/경고 노출 강화)
- Backend: 안정화/성능 보완/에러 케이스 강화
- Data: stale 관리 고도화
- Docs: 릴리즈 체크리스트
- QA: 회귀 + 릴리즈 게이트 검증

## 4) 범위 통제 규칙

1. 아래 항목은 MVP 구현 금지: 랭킹 전면전, 대형 커뮤니티, 독립 계산기군, 실시간 시세 포털.
2. 신규 기능 요청은 바로 구현하지 않고 `Backlog`로 이동.
3. "좋아 보이는 기능"보다 "재방문 이유(저장/변경추적/우선순위)"를 우선.
4. 강자 영역은 정면승부 대신 재조합 UX로 회피한다.

## 5) 개발창 세부 프롬프트 (역할별 복붙용)

### FE 프롬프트
```text
너는 FE 담당이다. 다음만 구현하라:
1) /, /expedition/:name, /character/:name, /weekly/:name
2) 저장 목록/변경 이벤트/ROI 카드 UI
3) loading/empty/error/partial 상태

주의:
- 외부 소스 직접 호출 금지
- API 계약 외 필드 가정 금지
- Non-goal 기능 구현 금지

완료 시:
- 화면별 상태 캡처
- 시나리오 A/B/C 동선 체크 결과
- 미완료 항목과 blocker 보고
```

### BE 프롬프트
```text
너는 BE 담당이다. 다음만 구현하라:
1) GET /api/home
2) GET /api/character/:name
3) GET /api/expedition/:name
4) GET /api/weekly/:name
5) GET /api/saved

필수:
- 공통 메타 필드(success, source, fetchedAt, cachedAt, stale, partial, warnings)
- 정규화 계층
- partial/warnings 처리
- ROI Engine v0 규칙 기반 결과 제공

완료 시:
- 엔드포인트별 샘플 응답(JSON)
- 실패/결측 케이스 응답 예시
- 캐시/소스 사용 로그 요약
```

### Data 프롬프트
```text
너는 데이터 수집 담당이다. 다음만 수행하라:
1) 공식 소스 우선 검증
2) 필드 매핑표 작성(소스 -> 내부 스키마)
3) 캐시 키/TTL 정책 적용
4) 소스 장애 시 fallback 규칙 정의

주의:
- 브라우저 직접 크롤링 금지
- 실시간 대규모 수집 설계 금지(MVP 범위 초과)

완료 시:
- 매핑표
- 캐시 정책표
- 장애 시 동작 시나리오
```

### QA 프롬프트
```text
너는 QA 담당이다. 시나리오 기반으로 검증하라:
1) P0 다캐릭 성장 관리자
2) P1 복귀/중간층
3) P1~P2 공대 운영 유저

필수 검증:
- loading/empty/error/partial/stale 노출
- 저장/변경추적 정상 동작
- Non-goal 기능 혼입 여부

완료 시:
- 시나리오별 PASS/FAIL
- 재현 절차
- 릴리즈 차단 이슈 목록
```

