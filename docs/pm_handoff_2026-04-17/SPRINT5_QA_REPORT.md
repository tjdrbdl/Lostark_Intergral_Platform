# Sprint 5 QA Report

## 1. Environment

| 항목 | 값 |
|---|---|
| date | 2026-05-07 |
| branch | main |
| commit | f33fe7c (Sprint 4 hardening) |
| LOSTARK_API_KEY | unset → IS_MOCK_MODE=true |
| dev server | http://localhost:3099 |
| Node | G:\Coding\Project_LostArk\.tools\node\node.exe (v24.15.0) |

---

## 2. Source 정합성 수정 (S5-T1)

| 위치 | 이전 | 이후 |
|---|---|---|
| `docs/API_SCHEMA.md` 공통 메타 필드 설명 | `` `lostark-api` `` | `` `lostark-openapi` `` |
| `docs/API_SCHEMA.md` source 정책 표 | `fallback` 항목 없음 | `fallback` 행 추가 |
| `src/app/api/home/route.ts` 에러 source | `"lostark-openapi"` | `"unknown"` |

---

## 3. Success Case — Mock Mode

| API | input | status | source | partial | warnings | result |
|---|---|---:|---|:---:|---|---|
| GET /api/home | — | 200 | `mock` | false | 0 | notices 1개, featuredContents 3개 반환 |
| GET /api/character/:name | `testchar` | 200 | `mock` | false | 0 | itemLevel=1680, class=소서리스, equipment 6개, gems 4개, engravings 5개 |
| GET /api/expedition/:name | `testchar` | 200 | `mock` | false | 0 | totalCharacterCount=4, roiCards=3 |
| GET /api/weekly/:name | `testchar` | 200 | `mock` | false | 0 | characters=2(1620 이상), roiFollowups=2 |
| GET /api/saved | — | 200 | `memory` | false | 0 | items=2, changeEvents=2 (mock seed) |

### Saved Write

| API | input | status | result |
|---|---|---:|---|
| POST /api/saved | 신규 key | **201** | item 생성, warnings=0 |
| POST /api/saved | 중복 key | **200** | lastSeenAt 갱신, warnings=1 ("이미 저장된 항목입니다.") |
| PATCH /api/saved/:id | `{"pinned":true}` 존재 id | 200 | item 수정 반환 |
| DELETE /api/saved/:id | 존재 id | 200 | `data.deleted=true` |

---

## 4. Failure Case

| Case | API | input | status | error.code | result |
|---|---|---|---:|---|---|
| 공백 이름 | GET /api/character/:name | `%20` (공백) | **400** | `INVALID_NAME` | "캐릭터 이름이 비어 있습니다." |
| 공백 이름 | GET /api/expedition/:name | `%20` (공백) | **400** | `INVALID_NAME` | "캐릭터 이름이 비어 있습니다." |
| PATCH 빈 body | PATCH /api/saved/:id | `{}` | **400** | `INVALID_BODY` | "수정 필드(pinned, tags, label) 중 하나 이상을 포함해야 합니다." |
| 없는 id DELETE | DELETE /api/saved/:id | `nonexistent-id` | **404** | `SAVED_NOT_FOUND` | "id=nonexistent-id 저장 항목을 찾을 수 없습니다." |
| POST 필수 필드 누락 | POST /api/saved | `{"type":"character"}` | **400** | `INVALID_BODY` | "type, key, label 필드가 필요합니다." |
| API 키 누락 | GET /api/character/:name | any | 200 | — | IS_MOCK_MODE=true → mock 데이터 정상 반환 |
| 잘못된 API 키 | (mock mode 불가) | — | — | — | **미테스트**: 아래 예상 동작 참조 |

### 잘못된 API 키 예상 동작 (미테스트)

| API | 예상 동작 |
|---|---|
| GET /api/character/:name | lostarkFetch → `!res.ok` → throw → `Promise.allSettled` profileRes=rejected → **404** `CHARACTER_NOT_FOUND` |
| GET /api/expedition/:name | fetchExpeditionCharacters.catch(()→null) → siblingsRes=null → **404** `EXPEDITION_NOT_FOUND` |
| GET /api/weekly/:name | fetchExpeditionCharacters.catch(()→null) → siblingsRes=null → **404** `WEEKLY_NOT_FOUND` |

> **리스크**: 잘못된 API 키가 404로 응답되어 "캐릭터 없음"으로 오인될 수 있음. 401 전용 에러코드(`AUTH_ERROR`) 분리를 should 검토 항목으로 등록.

---

## 5. Findings

### F1. 잘못된 API 키 → 404 오인 가능 (should 검토)

현재 `lostarkFetch`가 `!res.ok`(401 포함) 시 Error를 throw하고, 이를 expedition/weekly route는 `.catch(()=>null)`로 받아 404(NOT_FOUND)로 변환한다.
사용자 입장에서 API 키 오류와 없는 캐릭터가 동일하게 보인다.

**권장**: `lostarkFetch`가 401 응답 시 전용 에러 객체(`LostArkAuthError`)를 throw하고, route에서 `instanceof` 분기로 `AUTH_INVALID_KEY` 에러코드와 5xx를 반환하도록 개선.

### F2. home route에 실 데이터 소스 없음 (문서화됨)

`GET /api/home`은 API 키 유무와 무관하게 항상 fallback/mock 데이터를 반환한다 (`partial=true`, `source=["fallback","mock"]`).
이 정책은 TODO 주석에 명시되어 있으며, 홈 실데이터 소스(공지/추천 콘텐츠) 연동은 MVP 이후 과제다.

### F3. API 키 기준 실데이터 검증 미완료 (blocked)

`LOSTARK_API_KEY` 미설정으로 S5-T2, S5-T3, S5-T4(실데이터 QA)는 수행 불가.
Mock mode의 정상 동작은 검증됨.

---

## 6. Next Actions

| 우선순위 | 항목 | 근거 |
|---:|---|---|
| P0 | `LOSTARK_API_KEY` 설정 후 실데이터 QA 수행 | S5-T2~T4 완료 필요 |
| P1 | 잘못된 API 키 → `AUTH_INVALID_KEY` 에러코드 분리 | F1: 오인 가능 UX 개선 |
| P2 | Tooltip 파싱 우선순위 표 작성 | 장비 quality/level, 보석 skill 현재 0/빈 값 |
| P3 | saved store 영속화 후보 비교 (구현 아님) | in-memory 한계 문서화 |
