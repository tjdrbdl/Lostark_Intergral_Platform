# Sprint 5 Planning Handoff

작성일: 2026-05-07  
목적: Sprint 4 이후 개발창에 전달할 다음 작업 범위와 완료 기준을 정의한다.

## 1. Current State

### 완료된 범위

- Sprint 1+2: MVP 핵심 조회/검색/ROI/저장 목록/변경추적 UI 구현
- Sprint 3: Saved Write MVP 구현 및 안정화
- Sprint 4: 실데이터 null guard, 각인 응답 타입, 원정대 null 케이스 안정화
- `main` push 완료
- 워킹트리 clean 확인

### 최근 커밋

| commit | message |
|---|---|
| `f33fe7c` | `fix: Sprint 4 real-data hardening - null guards, engravings type, sibling null check, API_SCHEMA update` |
| `0256a7e` | `fix: Sprint 3 stabilization - router.refresh, no-store, PATCH empty body guard` |
| `574023e` | `feat: Sprint 3 saved write MVP` |

## 2. Sprint 5 Goal

Sprint 5의 목표는 기능 확장이 아니라 QA 가능한 MVP 상태를 만드는 것이다.

핵심 질문:
- API 문서와 실제 구현 표현이 일치하는가?
- 실제 API 키 기준으로 핵심 사용자 흐름이 증거와 함께 검증되었는가?
- 남은 데이터 정확도 TODO 중 무엇을 다음에 처리해야 하는가?

## 3. Task List

### Must

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S5-T1 | `source` 명칭 문서/구현 정합성 보정 | Docs/BE | `API_SCHEMA.md`와 코드가 `lostark-openapi` 기준으로 일치 |
| S5-T2 | 실제 API 키 기준 character API QA | QA/BE | 샘플 캐릭터 1개 이상 응답 결과 요약 |
| S5-T3 | 실제 API 키 기준 expedition API QA | QA/BE | 원정대 목록/대표 캐릭터/ROI 카드 확인 |
| S5-T4 | 실제 API 키 기준 weekly API QA | QA/BE | 주간 체크/ROI 후속 후보 확인 |
| S5-T5 | 실패 케이스 QA | QA/BE | 없는 캐릭터, 잘못된 키, 키 누락 케이스 결과 정리 |
| S5-T6 | QA 결과 md 작성 | QA/Docs | 테스트 입력/결과/남은 리스크 문서화 |

### Should

| ID | Task | Owner | 완료 기준 |
|---|---|---|
| S5-T7 | Tooltip 파싱 우선순위 표 작성 | PM/BE | 장비 quality/level, 보석 skill 중 MVP 필요 여부 판단 |
| S5-T8 | API 401 에러 분리 검토 | BE | 잘못된 키를 명확한 에러코드로 분리할지 결정 |
| S5-T9 | saved store 영속화 후보 비교 | PM/BE | in-memory, localStorage, file, SQLite/DB 비교 |

### Could

| ID | Task | Owner | 완료 기준 |
|---|---|---|
| S5-T10 | 실제 응답 샘플을 fixtures로 분리 검토 | BE/QA | mock 개선 필요성 판단 |
| S5-T11 | ROI v0 설명 문구 튜닝 | PM/FE | "정답"이 아닌 "실행 후보" 표현 유지 |

## 4. Route / Module Ownership

| Route/Module | 책임 |
|---|---|
| `/api/character/:name` | 실제 캐릭터 데이터 조회, 부분 성공 처리 |
| `/api/expedition/:name` | 원정대 목록/대표 캐릭터/ROI v0 생성 |
| `/api/weekly/:name` | 주간 체크/ROI 후속 후보 생성 |
| `src/lib/lostark-api.ts` | 외부 API 호출 및 원시 타입 경계 |
| `src/lib/normalize.ts` | null-safe 정규화 |
| `docs/API_SCHEMA.md` | API 계약 기준 문서 |
| `docs/pm_handoff_2026-04-17/*` | PM/개발창 handoff 기록 |

## 5. Dev Prompt

```text
너는 LostArk Data Hub Sprint 5 개발/QA 담당이다.

[현재 상태]
Sprint 4까지 완료되어 실데이터 null guard, 각인 응답 타입, 원정대 null 케이스 안정화가 main에 push되어 있다.
이번 Sprint의 목표는 새 기능 추가가 아니라 QA 가능한 MVP 상태를 만드는 것이다.

[절대 원칙]
- MVP 범위 밖 기능 추가 금지
- 프론트에서 외부 LostArk API 직접 호출 금지
- 백엔드가 외부 응답을 내부 표준 스키마로 정규화
- 실패 시 전체 실패보다 partial/warnings 우선
- 로그인/협업/랭킹/커뮤니티/실시간 시세 포털 구현 금지

[Must]
1. API_SCHEMA.md의 source 값 정책을 코드와 일치시킨다.
- 구현 기준 source 값: mock, fallback, memory, lostark-openapi, unknown
- 문서에 lostark-api처럼 다른 표기가 있으면 lostark-openapi로 통일

2. 실제 LOSTARK_API_KEY 기준으로 아래 API를 검증한다.
- GET /api/character/:name
- GET /api/expedition/:name
- GET /api/weekly/:name

3. 실패 케이스를 검증한다.
- 존재하지 않는 캐릭터
- API 키 누락
- 잘못된 API 키

4. QA 결과 md를 작성한다.
- 테스트 입력
- 응답 status
- source
- partial/warnings
- 확인 결과
- 남은 리스크

[Should]
1. Tooltip 파싱 우선순위 표를 작성한다.
- 장비 quality
- 장비 level
- 보석 skill
- 카드/성장 요소

2. 잘못된 API 키 에러를 별도 코드로 분리할지 검토한다.
- 현재는 fetch error 계열로 처리될 수 있음
- 분리 시 MVP에서 어떤 사용자 메시지를 줄지 제안

[Could]
1. saved store 영속화 후보를 비교만 한다.
- 구현하지 않는다.
- DB/로그인/권한은 아직 범위 밖

[검증]
- npm run build
- npm run lint
- 실제 API 키 기준 수동 API 호출 결과

[완료 보고 형식]
1. 구현/검증 범위
2. 문서 정합성 수정 내용
3. 실제 API 테스트 결과
4. 실패 케이스 테스트 결과
5. 남은 리스크와 다음 제안
```

## 6. QA Report Template

개발창은 Sprint 5 완료 시 아래 형식의 md를 생성한다.

```markdown
# Sprint 5 QA Report

## 1. Environment
- date:
- branch:
- commit:
- LOSTARK_API_KEY: set/unset/masked

## 2. Success Case

| API | input | status | source | partial | warnings | result |
|---|---|---:|---|---:|---|---|
| GET /api/character/:name |  |  |  |  |  |  |
| GET /api/expedition/:name |  |  |  |  |  |  |
| GET /api/weekly/:name |  |  |  |  |  |  |

## 3. Failure Case

| Case | API | input | status | error.code | result |
|---|---|---|---:|---|---|
| invalid character |  |  |  |  |  |
| missing key |  |  |  |  |  |
| invalid key |  |  |  |  |  |

## 4. Findings

## 5. Next Actions
```

## 7. Done Criteria

- `API_SCHEMA.md` source 정책이 구현과 일치한다.
- 실제 API 키 기준 핵심 API 3개가 검증된다.
- 실패 케이스 결과가 문서화된다.
- QA Report md가 생성된다.
- 새 기능을 추가하지 않는다.

