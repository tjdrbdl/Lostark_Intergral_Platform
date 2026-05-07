# Sprint 3 Dev Handoff

작성일: 2026-05-07  
작성 목적: 개발창에 전달할 Sprint 3 작업 범위, 구현 순서, 책임, 완료 기준을 고정한다.

## 1. Current Progress

### 완료된 milestone

| milestone | 상태 | 내용 |
|---|---:|---|
| M0 Scope/PM 문서화 | 완료 | MVP 범위, 핵심 시나리오, 핵심 페이지, API 원칙, 실패/캐시 원칙 정리 |
| M1 Mock 기반 MVP 골격 | 완료 | Next.js 앱 구조, 5개 API mock, 홈/캐릭터/원정대/주간 라우트 구성 |
| M2 Core Flow | 완료 | 검색 → 통합결과 → 주간 흐름, loading/empty/error/partial 상태 반영 |
| M3 ROI/저장/변경추적 | 완료권 | ROI v0, 저장 목록, 변경 이벤트가 홈/원정대/캐릭터/주간에 연결됨 |
| M4 안정화/Sprint 3 | 다음 | 저장 쓰기 계약, API_SCHEMA 보강, 실데이터 회귀 테스트, 릴리즈 게이트 |

### 현재 구현된 핵심 기능

- `GET /api/home`
- `GET /api/character/:name`
- `GET /api/expedition/:name`
- `GET /api/weekly/:name`
- `GET /api/saved`
- 공통 메타 필드 적용: `success`, `source`, `fetchedAt`, `cachedAt`, `stale`, `partial`, `warnings`
- `/search?q=&type=` 라우트 추가
- 원정대 ROI 카드 `buildRoiCardsV0` 연결
- 주간 ROI 후속 후보 `buildWeeklyRoiFollowups` 연결
- 저장/변경추적 UI를 홈/원정대/캐릭터/주간에 노출
- API 키 사용 시 `home/saved`가 비어 보이는 문제에 fallback 처리 추가

### 현재 미커밋 변경

- `src/app/api/home/route.ts`
- `src/app/api/saved/route.ts`

## 2. Sprint 3 Goal

Sprint 3의 목표는 Sprint 2에서 완성한 조회/ROI/변경추적 흐름을 최소 운영 가능한 수준으로 안정화하는 것이다.

핵심은 저장 목록 + 변경추적 경험을 읽기 전용에서 최소 쓰기 가능 상태로 확장하되, 로그인/협업/대형 개인화 기능으로 범위를 넓히지 않는 것이다.

## 3. Task List

### Must

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S3-T1 | `saved write` API 계약 확정 | PM/BE | `POST`, `PATCH`, `DELETE` 요청/응답 스키마 문서화 |
| S3-T2 | `POST /api/saved` 구현 | BE | character/expedition/query 저장 생성 가능 |
| S3-T3 | `PATCH /api/saved/:id` 구현 | BE | `pinned`, `label`, `tags` 수정 가능 |
| S3-T4 | `DELETE /api/saved/:id` 구현 | BE | 저장 항목 삭제 가능 |
| S3-T5 | 저장 액션 UI 연결 | FE | 원정대/캐릭터 페이지에서 저장/해제 상태 확인 가능 |
| S3-T6 | API_SCHEMA 문서 최신화 | Docs | `roiFollowups`, saved write 계약 반영 |
| S3-T7 | 실데이터 회귀 테스트 | QA/BE | API 키 사용 상태에서 핵심 페이지 응답 확인 |

### Should

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S3-T8 | 저장 목록 정렬 정책 적용 | FE/BE | `pinned` 우선, `lastSeenAt` 최신순 |
| S3-T9 | ROI 규칙표 문서화 | PM/Docs | 입력값, 규칙, 한계, 설명 방식 문서화 |
| S3-T10 | fallback 상태 UX 점검 | FE/QA | `partial/warnings`가 화면에서 명확히 표시됨 |

### Could

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S3-T11 | 변경 이벤트 severity 필터 UI | FE | low/mid/high 필터링 가능 |
| S3-T12 | localStorage fallback 검토 | FE/BE | DB 미연동 상황에서 임시 저장 가능성 판단 |

## 4. Route / Module Ownership

### Route ownership

| Route | 책임 |
|---|---|
| `/` | 검색 진입, 저장 목록 미리보기, 변경 이벤트 미리보기 |
| `/search` | 검색 query/type을 받아 목적 라우트로 리다이렉트 |
| `/expedition/:name` | 원정대 통합 허브, ROI 카드, 저장/변경추적 중심 페이지 |
| `/character/:name` | 캐릭터 상세 스펙, 같은 원정대 이동, 캐릭터 변경 이벤트 |
| `/weekly/:name` | 주간 체크, ROI 후속 후보, 주간 변경 이력 |
| `/api/*` | 외부 소스 은닉, 표준 스키마 정규화, partial/warnings 처리 |

### Module ownership

| Module | 책임 |
|---|---|
| `src/lib/lostark-api.ts` | LostArk Open API 호출 |
| `src/lib/normalize.ts` | 외부 응답 → 내부 스키마 정규화 |
| `src/lib/roi-engine.ts` | ROI v0 규칙 기반 후보 생성 |
| `src/lib/mock-data.ts` | mock/fallback 데이터 |
| `src/types/api.ts` | 공통 API 응답 계약 |
| `src/types/saved.ts` | 저장 항목/변경 이벤트 계약 |

## 5. API Contract Draft

### `POST /api/saved`

요청:

```json
{
  "type": "character|expedition|query",
  "key": "string",
  "label": "string",
  "pinned": false,
  "tags": ["string"]
}
```

응답:

```json
{
  "success": true,
  "source": ["local-store"],
  "fetchedAt": "2026-05-07T00:00:00Z",
  "cachedAt": null,
  "stale": false,
  "partial": false,
  "warnings": [],
  "data": {
    "item": {
      "id": "string",
      "type": "character|expedition|query",
      "key": "string",
      "label": "string",
      "pinned": false,
      "tags": ["string"],
      "lastSeenAt": "string|null"
    }
  }
}
```

### `PATCH /api/saved/:id`

요청:

```json
{
  "label": "string",
  "pinned": true,
  "tags": ["string"]
}
```

응답:

```json
{
  "success": true,
  "source": ["local-store"],
  "fetchedAt": "2026-05-07T00:00:00Z",
  "cachedAt": null,
  "stale": false,
  "partial": false,
  "warnings": [],
  "data": {
    "item": {}
  }
}
```

### `DELETE /api/saved/:id`

응답:

```json
{
  "success": true,
  "source": ["local-store"],
  "fetchedAt": "2026-05-07T00:00:00Z",
  "cachedAt": null,
  "stale": false,
  "partial": false,
  "warnings": [],
  "data": {
    "deletedId": "string"
  }
}
```

## 6. Dev Prompt

```text
너는 LostArk Data Hub Sprint 3 개발 담당이다.

[현재 상태]
Sprint 1+2 구현은 완료되어 있다.
핵심 흐름은 / → /search → /expedition/:name → /weekly/:name 으로 연결되어 있다.
ROI v0, 저장 목록, 변경추적 UI는 홈/원정대/캐릭터/주간 페이지에 반영되어 있다.
현재 미커밋 변경으로 /api/home, /api/saved에 실데이터 미연동 구간 fallback 처리가 들어가 있다.

[절대 원칙]
- MVP 범위 밖 기능 추가 금지
- 프론트에서 외부 API 직접 호출 금지
- 백엔드가 외부 응답을 내부 표준 스키마로 정규화
- 실패 시 전체 실패보다 partial/warnings 우선
- mock/fallback → 실제 데이터 연결 순서 유지

[이번 구현 Task]
저장 목록 + 변경추적 경험을 읽기 전용에서 최소 쓰기 가능 상태로 확장한다.

[Must]
1. POST /api/saved 구현
2. PATCH /api/saved/:id 구현
3. DELETE /api/saved/:id 구현
4. 원정대/캐릭터 페이지에서 저장/해제 액션 연결
5. API_SCHEMA.md에 saved write 계약 반영

[범위 제한]
- 로그인 구현 금지
- 협업/공대 운영 기능 구현 금지
- 대형 개인화 시스템 구현 금지
- 실시간 시세 포털 구현 금지

[완료 기준]
1. 저장 생성/수정/삭제 API가 동작한다.
2. 저장 API가 공통 메타 필드를 일관되게 반환한다.
3. 홈/원정대/캐릭터 페이지에서 저장 상태가 사용자에게 보인다.
4. 인증/협업/대형 개인화 기능은 구현하지 않는다.
5. npm run build, npm run lint 통과 결과를 보고한다.

[완료 보고 형식]
1. 구현 범위
2. API 계약 반영 내용
3. UI/상태 처리 반영 내용
4. 테스트 결과
5. 남은 리스크
```

## 7. PM TODO List

| 우선순위 | TODO | 담당 | 상태 |
|---:|---|---|---|
| 1 | `saved write` 정책 확정: 단일 사용자 로컬 저장 vs 파일/DB 저장 | PM | 대기 |
| 2 | `POST/PATCH/DELETE /api/saved` 계약서 작성 | PM/BE | 초안 작성 |
| 3 | `API_SCHEMA.md` 최신화: `roiFollowups`, saved write 추가 | Docs | 대기 |
| 4 | fallback 데이터 UX 문구 확정: 샘플/실데이터 구분 | PM/FE | 대기 |
| 5 | 실데이터 API 키 사용 시 `character/expedition/weekly` 회귀 테스트 | QA/BE | 대기 |
| 6 | 핵심 시나리오 A/B/C 수동 테스트 체크리스트 작성 | QA | 대기 |
| 7 | out-of-scope 목록 재확인: 랭킹/커뮤니티/독립 계산기/실시간 시세 제외 유지 | PM | 진행 |

## 8. Done Criteria

- 저장 생성/수정/삭제가 MVP 범위 안에서 동작한다.
- 저장/변경추적 흐름이 홈, 원정대, 캐릭터 페이지에서 끊기지 않는다.
- API 응답은 공통 메타 필드를 유지한다.
- 실데이터 실패나 미연동 구간은 `partial/warnings`로 표시한다.
- 프론트는 외부 소스를 모른다.
- 로그인/협업/실시간 시세/랭킹 전면전은 구현하지 않는다.

