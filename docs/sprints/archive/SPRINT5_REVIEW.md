# Sprint 5 Code Review & Sprint 6 Handoff

작성일: 2026-07-12  
대상 브랜치: `main`  
리뷰 기준 커밋: `7546f8c fix: Sprint 5 real API null guards + AUTH_INVALID_KEY + QA report`  
추가 확인 범위: 현재 working tree 미커밋 UI 변경

---

## 1. Review Summary

Sprint 5의 실데이터 null guard, 각인 응답 wrapper 반영, API source 정합화는 MVP 안정화 방향에 맞다.
다만 배포/QA 기준에서는 아직 release blocker가 남아 있다.

| 항목 | 결과 |
|---|---|
| `next lint` | PASS |
| `next build` | FAIL: `fetch failed`, `ECONNREFUSED` |
| git 상태 | 코드 파일 4개 미커밋 변경 + `tsconfig.tsbuildinfo` untracked |
| Sprint 5 QA 문서 | 존재하지만 `AUTH_INVALID_KEY` 검증은 실제 코드 흐름과 불일치 가능 |

현재 다음 단계는 기능 추가가 아니라 **빌드 안정화 + 인증 실패 오인 수정 + 미커밋 UI 변경 정리**다.

---

## 2. Findings

### P0. `next build`가 self-fetch 실패로 비정상 종료됨

관련 위치:
- `src/app/page.tsx:10-11`
- `src/app/character/[name]/page.tsx:15-18`
- `src/app/expedition/[name]/page.tsx:17-21`
- `src/app/weekly/[name]/page.tsx:15-19`

현재 서버 컴포넌트가 `NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"`으로 내부 API를 다시 호출한다.
`.env.local`에는 `LOSTARK_API_KEY`만 있고 `NEXT_PUBLIC_BASE_URL`은 없어서, 빌드 중 `localhost:3000` 연결 실패가 발생한다.

완료 기준:
- `npm run build` 또는 동일한 Next build 명령이 exit code 0으로 종료되어야 한다.
- 빌드 시 dev server가 떠 있지 않아도 홈 페이지가 실패하지 않아야 한다.
- 프론트는 외부 LostArk API를 몰라야 하며, 내부 데이터 조립은 백엔드/서버 모듈에서 정규화해야 한다.

권장 방향:
- API route 로직과 page data loader가 공유할 수 있는 서버 전용 service module을 분리한다.
- page에서 자기 자신의 `/api/*`를 HTTP로 호출하지 않도록 한다.
- 단기 보정으로 `NEXT_PUBLIC_BASE_URL` 강제 의존을 추가하는 방식은 배포 환경 결합도가 높아져 우선순위를 낮춘다.

---

### P0. `AUTH_INVALID_KEY`가 401이 아니라 404로 오인될 수 있음

관련 위치:
- `src/app/api/character/[name]/route.ts:41-52`
- `src/app/api/expedition/[name]/route.ts:46-50`
- `src/app/api/weekly/[name]/route.ts:72-76`

`LostArkAuthError` 클래스와 catch 분기는 추가됐지만, 실제 호출부에서 인증 실패가 먼저 삼켜진다.

문제 흐름:
- character route는 `Promise.allSettled`를 사용한다.
- 프로필 요청이 `LostArkAuthError`로 reject되어도 catch로 가지 않고 `profileRes.status === "rejected"` 분기에 들어간다.
- 결과적으로 `AUTH_INVALID_KEY`가 아니라 `CHARACTER_NOT_FOUND` 404가 반환될 수 있다.
- expedition/weekly route는 `fetchExpeditionCharacters(...).catch(() => null)` 때문에 인증 실패도 not found로 변환될 수 있다.

완료 기준:
- 잘못된 `LOSTARK_API_KEY`로 아래 3개 API가 모두 HTTP 401 + `error.code="AUTH_INVALID_KEY"`를 반환해야 한다.
- `GET /api/character/:name`
- `GET /api/expedition/:name`
- `GET /api/weekly/:name`
- 없는 캐릭터/원정대는 계속 404로 반환되어야 한다.

권장 방향:
- `LostArkAuthError`는 partial/not-found fallback으로 변환하지 않는다.
- `allSettled` 결과에 rejected reason이 `LostArkAuthError`인지 먼저 검사한다.
- `.catch(() => null)`은 인증 실패를 제외한 not-found/fetch 실패에만 제한한다.

---

### P1. 홈/레이아웃 미커밋 변경에 특정 캐릭터 하드코딩이 있음

관련 위치:
- `src/app/layout.tsx:26`
- `src/app/page.tsx:40`

현재 글로벌 nav와 홈 CTA에 `/weekly/아르페지오`, `/expedition/아르페지오`가 하드코딩되어 있다.
이 값은 기획 문서에서 확정된 demo character가 아니며, 실제 API/사용자 환경에 따라 404 또는 잘못된 사용 흐름을 만들 수 있다.

완료 기준:
- 글로벌 nav/홈 CTA에서 특정 캐릭터명 하드코딩을 제거한다.
- demo entry가 필요하면 mock/dev 전용으로 명확히 분리하고, 운영 UX의 기본 CTA는 검색 중심이어야 한다.

---

### P1. 홈 페이지 error/empty 상태 표현이 축소됨

관련 위치:
- `src/app/page.tsx:8-13`
- `src/app/page.tsx:46`

현재 `load()`가 모든 fetch 실패를 `null`로 삼키고, 화면에서는 `PartialWarning`만 표시한다.
기존 MVP 원칙인 loading/empty/error/partial 상태 중 error/empty 구분이 약해졌다.

완료 기준:
- 홈 데이터와 저장 목록 모두 실패한 경우 명확한 error state를 보여준다.
- 저장 목록이 비어 있는 경우 empty state를 보여준다.
- partial warning은 유지하되 error/empty를 대체하지 않는다.

---

### P2. saved item의 `query` 타입이 expedition으로 오라우팅될 수 있음

관련 위치:
- `src/app/page.tsx:63`

`SavedItem.type`은 `"character" | "expedition" | "query"`를 허용하지만, 홈 저장 목록 링크는 character가 아니면 모두 expedition으로 보낸다.
향후 query 저장이 실제로 생성되면 `/expedition/:query`로 잘못 이동할 수 있다.

완료 기준:
- `query` 타입을 지원하지 않을 경우 UI에서 명시적으로 숨기거나 비활성 처리한다.
- 지원할 경우 `/search?q=...&type=...` 형태로 라우팅한다.

---

### P2. `tsconfig.tsbuildinfo`가 untracked로 남아 있음

관련 위치:
- `tsconfig.tsbuildinfo`
- `.gitignore:1-9`

`tsconfig.json`의 `incremental: true` 때문에 생성된 파일로 보인다.
커밋 대상이 아니라면 `.gitignore`에 추가하거나 작업 전 정리해야 한다.

완료 기준:
- `git status -sb`에서 불필요한 build artifact가 보이지 않아야 한다.

---

### P2. 주간 reset 계산은 기준일/당일 오전 처리 검증 필요

관련 위치:
- `src/app/api/weekly/[name]/route.ts:36-43`

현재 코드는 목요일 06:00 기준으로 보이며, 같은 목요일 06:00 이전에도 다음 주 목요일로 밀릴 수 있다.
또한 실제 서비스 기준 요일/시각은 PM 확인이 필요하다.

완료 기준:
- MVP 문서에 주간 reset 기준 요일/시각을 명시한다.
- 코드가 해당 기준에 맞게 당일 reset 이전/이후를 구분한다.

---

## 3. Sprint 6 Goal

Sprint 6 목표는 기능 추가가 아니라 **QA 가능한 MVP 안정화**다.

범위:
- 빌드 실패 제거
- 인증 실패/없는 캐릭터 구분 정확화
- 미커밋 UI 변경의 MVP 적합성 정리
- 홈 상태 처리 회복
- 문서/QA 결과 갱신

범위 밖:
- 신규 대형 UI 개편
- 저장소 DB 영속화 구현
- Tooltip 파싱 전체 구현
- 협업/랭킹/커뮤니티/실시간 시세 확장

---

## 4. Task List

### Must

| ID | 영역 | 작업 | 완료 기준 |
|---|---|---|---|
| S6-T1 | Build | page에서 자기 `/api/*` HTTP self-fetch 제거 또는 빌드 안전 loader로 교체 | dev server 없이 `next build` exit 0 |
| S6-T2 | API | `LostArkAuthError`가 not-found/partial fallback으로 삼켜지지 않도록 수정 | 잘못된 API 키 3개 route 모두 401 |
| S6-T3 | API QA | 실제 없는 캐릭터와 잘못된 API 키를 분리 검증 | not found는 404, auth는 401 |
| S6-T4 | UI | 홈/레이아웃의 특정 캐릭터 하드코딩 제거 | `/weekly/아르페지오`, `/expedition/아르페지오` 제거 |
| S6-T5 | Git hygiene | `tsconfig.tsbuildinfo` 정리 | `git status`에 artifact 없음 |
| S6-T6 | Docs | Sprint 6 QA report 작성 | build/lint/API failure case 결과 포함 |

### Should

| ID | 영역 | 작업 | 완료 기준 |
|---|---|---|---|
| S6-T7 | UI State | 홈 error/empty/partial 상태 복구 | 전체 실패/error, 저장 없음/empty 구분 |
| S6-T8 | Routing | saved `query` 타입 라우팅 정책 정리 | query 미지원이면 숨김, 지원이면 `/search`로 이동 |
| S6-T9 | Weekly | reset 기준 요일/시각 문서화 | PM 기준 확정 후 코드와 문서 일치 |

### Could

| ID | 영역 | 작업 | 완료 기준 |
|---|---|---|---|
| S6-T10 | QA | API smoke test script 초안 작성 | character/expedition/weekly/saved 수동 QA 반복 비용 감소 |
| S6-T11 | Docs | Tooltip parsing 우선순위 표 별도 작성 | quality/level/skill 중 MVP 영향도 순서화 |

---

## 5. Route / Module Ownership

| 영역 | 파일 | 책임 |
|---|---|---|
| API client | `src/lib/lostark-api.ts` | LostArk Open API 호출, 인증 실패 에러 보존 |
| Normalize | `src/lib/normalize.ts` | 외부 응답 null/undefined 방어 및 내부 스키마 변환 |
| Character API | `src/app/api/character/[name]/route.ts` | 프로필 필수, 장비/보석/각인/원정대 목록 partial |
| Expedition API | `src/app/api/expedition/[name]/route.ts` | 원정대 목록 필수, 대표 캐릭터 상세 partial |
| Weekly API | `src/app/api/weekly/[name]/route.ts` | 원정대 기반 주간 후보 생성, reset 기준 관리 |
| Home Page | `src/app/page.tsx` | 검색 진입, 저장 목록, 최근 변화, 홈 상태 처리 |
| Search | `src/components/SearchBar.tsx`, `src/app/search/page.tsx` | 검색 type/q를 route로 변환 |
| Saved | `src/app/api/saved/*`, `src/lib/saved-store.ts` | MVP in-memory 저장/수정/삭제 |
| Docs | `docs/API_SCHEMA.md`, `docs/sprints/*` | API 계약과 QA 결과 동기화 |

---

## 6. Dev Handoff Prompt

개발창에 아래 프롬프트를 그대로 전달한다.

```text
docs/sprints/archive/SPRINT5_REVIEW.md 파일을 기준으로 Sprint 6 안정화 작업을 진행해줘.

원칙:
- 기능 추가하지 말 것.
- MVP 범위 확장하지 말 것.
- 프론트가 LostArk 외부 API를 직접 알지 않게 할 것.
- mock → real data 연결 원칙 유지.
- 빌드/인증 실패/상태 처리 안정화가 우선.

Must 작업:
1. `next build`가 dev server 없이 exit code 0이 되도록 self-fetch 구조를 안정화한다.
2. 잘못된 `LOSTARK_API_KEY`가 character/expedition/weekly route에서 모두 401 `AUTH_INVALID_KEY`로 반환되게 한다.
3. 없는 캐릭터/원정대는 계속 404 not found로 반환되게 한다.
4. 홈/레이아웃의 특정 캐릭터명 하드코딩(`/weekly/아르페지오`, `/expedition/아르페지오`)을 제거한다.
5. `tsconfig.tsbuildinfo` 같은 build artifact를 정리한다.
6. Sprint 6 QA report md를 작성한다.

검증:
- lint 통과
- build 통과
- mock mode 주요 API 확인
- real API mode character/expedition/weekly 확인
- invalid API key 401 확인
- nonexistent character 404 확인

완료 보고:
- 변경 파일
- build/lint 결과
- API QA 결과
- 남은 리스크
- 다음 Sprint 후보
```

---

## 7. Done Criteria

Sprint 6 완료 조건:
- `next build` exit code 0
- `next lint` warnings/errors 0
- `GET /api/character/:name` invalid key → 401 `AUTH_INVALID_KEY`
- `GET /api/expedition/:name` invalid key → 401 `AUTH_INVALID_KEY`
- `GET /api/weekly/:name` invalid key → 401 `AUTH_INVALID_KEY`
- nonexistent character/expedition/weekly → 404 유지
- 홈/레이아웃에서 특정 캐릭터명 hardcode 제거
- 홈 상태가 loading/empty/error/partial 원칙을 다시 만족
- `git status -sb`에 의도하지 않은 artifact 없음
- `docs/sprints/archive/SPRINT6_QA.md` 작성
