# Sprint 4 Planning Handoff

작성일: 2026-05-07  
목적: Sprint 4에서 개발창에 전달할 작업 범위, 우선순위, 완료 기준을 정의한다.

## 1. Current State

### 완료된 범위

- Sprint 1+2: MVP 핵심 조회/검색/ROI/저장 목록/변경추적 UI 구현
- Sprint 3: Saved Write MVP 구현
- `main` push 완료
- 워킹트리 clean 확인

### 현재 핵심 흐름

```text
/ → /search?q=&type= → /expedition/:name → /weekly/:name
                      → /character/:name
```

### 현재 구현된 API

- `GET /api/home`
- `GET /api/character/:name`
- `GET /api/expedition/:name`
- `GET /api/weekly/:name`
- `GET /api/saved`
- `POST /api/saved`
- `PATCH /api/saved/:id`
- `DELETE /api/saved/:id`

## 2. Sprint 4 Goal

Sprint 4의 목표는 기능 확장이 아니라 실데이터 연결 안정화와 MVP 신뢰도 확보이다.

핵심 질문:
- 실제 LostArk Open API 키를 넣었을 때 핵심 페이지가 정상 동작하는가?
- 외부 API 실패/부분 누락이 UI에 정상적으로 표시되는가?
- mock/fallback/real 데이터 경계가 개발자와 사용자 모두에게 명확한가?

## 3. Recommended Direction

PM 권장 우선순위:

1. 실데이터 안정화
2. 실패/부분성공 QA
3. API/문서 정합성 보강
4. 저장소 영속화 검토

저장소 영속화보다 실데이터 안정화를 먼저 권장하는 이유:
- 현재 제품 가치는 원정대/캐릭터 조회 신뢰도에서 먼저 검증된다.
- in-memory 저장은 MVP 제약으로 설명 가능하다.
- 반면 실제 조회가 깨지면 ROI/주간/저장 흐름 전체 가치가 약해진다.

## 4. Task List

### Must

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S4-T1 | 실 API 키 기준 `/api/character/:name` 검증 | BE/QA | 실제 캐릭터 1개 이상 200 응답 또는 명확한 에러 반환 |
| S4-T2 | 실 API 키 기준 `/api/expedition/:name` 검증 | BE/QA | 원정대 캐릭터 목록, topCharacter, ROI 카드 확인 |
| S4-T3 | 실 API 키 기준 `/api/weekly/:name` 검증 | BE/QA | weekly characters, roiFollowups 확인 |
| S4-T4 | 외부 API 실패 케이스 점검 | BE/QA | `partial`, `warnings`, `error.code`가 UI/API에 명확히 반영 |
| S4-T5 | mock/fallback/real source 표시 점검 | BE/FE | `source` 값이 상황별로 일관됨 |
| S4-T6 | API_SCHEMA.md 실응답 기준 보강 | Docs | character/expedition/weekly 실제 응답 필드와 문서 간 차이 정리 |

### Should

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S4-T7 | LostArk Open API 원시 응답 필드 검증 | BE | `lostark-api.ts` 타입 TODO 목록 업데이트 |
| S4-T8 | normalize 보강 필요 필드 목록화 | BE/Docs | 장비/보석/각인 중 누락/추정 필드 정리 |
| S4-T9 | QA 시나리오 체크리스트 작성 | QA | P0/P1/P1~P2 경로별 PASS/FAIL 표 |

### Could

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S4-T10 | saved store 영속화 후보 비교 | PM/BE | localStorage/file/SQLite/DB 중 MVP 적합성 비교 |
| S4-T11 | ROI v0 규칙 튜닝 후보 수집 | PM/BE | 실제 응답 기반 개선 후보 문서화 |

## 5. Route / Module Ownership

| Route/Module | 책임 |
|---|---|
| `/api/character/:name` | 캐릭터 기본/장비/보석/각인/원정대 일부 조회, partial 처리 |
| `/api/expedition/:name` | 원정대 목록, 대표 캐릭터 상세, ROI v0 생성 |
| `/api/weekly/:name` | 원정대 목록 기반 주간 체크/ROI 후속 후보 생성 |
| `src/lib/lostark-api.ts` | LostArk Open API 호출 경계 |
| `src/lib/normalize.ts` | 외부 응답 정규화 |
| `src/lib/roi-engine.ts` | 정규화 데이터 기반 ROI 후보 생성 |
| `src/types/*` | 내부 표준 응답 타입 |

## 6. Dev Prompt

```text
너는 LostArk Data Hub Sprint 4 개발 담당이다.

[현재 상태]
Sprint 3까지 완료되어 Saved Write MVP가 main에 push되어 있다.
GET/POST/PATCH/DELETE /api/saved가 동작하고, 원정대/캐릭터 페이지에 SaveButton이 연결되어 있다.
이번 Sprint의 목표는 기능 확장이 아니라 실데이터 연결 안정화와 MVP 신뢰도 확보다.

[절대 원칙]
- MVP 범위 밖 기능 추가 금지
- 프론트에서 외부 LostArk API 직접 호출 금지
- 백엔드가 외부 응답을 내부 표준 스키마로 정규화
- 실패 시 전체 실패보다 partial/warnings 우선
- mock/fallback → 실제 데이터 연결 순서 유지
- 로그인/협업/랭킹/커뮤니티/실시간 시세 포털 구현 금지

[Must]
1. 실제 LOSTARK_API_KEY 기준으로 아래 API를 검증한다.
- GET /api/character/:name
- GET /api/expedition/:name
- GET /api/weekly/:name

2. 실제 응답에서 깨지는 필드를 확인한다.
- lostark-api.ts 원시 타입과 실제 응답 차이
- normalize.ts에서 null/undefined 처리 필요한 필드
- ROI Engine v0이 빈/부분 데이터에서 안전하게 동작하는지

3. 실패/부분성공 처리를 점검한다.
- 존재하지 않는 캐릭터
- 장비/보석/각인 일부 실패
- 원정대 조회 실패
- API 키 누락 또는 잘못된 키

4. API_SCHEMA.md를 실응답 기준으로 보강한다.
- character
- expedition
- weekly
- saved
- common meta fields

[Should]
1. QA 시나리오 체크리스트를 작성한다.
- P0 다캐릭 성장 관리자
- P1 복귀/중간층
- P1~P2 공대장/깐부 운영 유저

2. source 값 정책을 확인한다.
- mock
- fallback
- memory
- lostark-openapi

[Could]
1. saved store 영속화 후보만 비교한다.
- 구현은 하지 않는다.
- DB/로그인/권한은 MVP 이후 결정한다.

[검증]
- npm run build
- npm run lint
- 실제 API 키 기준 수동 API 호출 결과
- 핵심 페이지 수동 확인

[완료 보고 형식]
1. 구현/검증 범위
2. 실제 API 응답 확인 결과
3. partial/warnings/error 처리 결과
4. 문서 업데이트 내용
5. 남은 리스크
```

## 7. QA Checklist Draft

| Scenario | Entry | Expected |
|---|---|---|
| P0 다캐릭 성장 관리자 | `/expedition/:name` | 원정대 목록, ROI 카드, 저장 버튼 확인 |
| P1 복귀/중간층 | `/character/:name` | 캐릭터 요약, 원정대 이동, 저장 버튼 확인 |
| P1~P2 공대 운영 | `/weekly/:name` | 주간 체크, ROI 후속 후보, 변경 이력 확인 |
| 잘못된 캐릭터 | `/character/invalid-name` | 404 또는 명확한 에러 |
| API 키 누락 | `.env.local` key 없음 | mock/fallback 경로 유지 |
| API 키 오류 | 잘못된 key | error 또는 partial/warnings 명확히 표시 |

## 8. Done Criteria

- 실제 API 키로 핵심 API 3개가 검증된다.
- 실데이터에서 필드 누락이 있어도 전체 앱이 무너지지 않는다.
- 실패/부분성공 상태가 API와 UI에서 명확히 드러난다.
- `API_SCHEMA.md`가 실제 응답 기준으로 업데이트된다.
- 기능 범위가 MVP 밖으로 확장되지 않는다.

