# API Schema

## 공통 메타 필드
| 필드 | 타입 | 설명 |
|------|------|------|
| `success` | boolean | 요청 성공 여부 |
| `source` | string[] | 데이터 소스 목록 (`mock`, `lostark-openapi`, `memory`, `fallback` 등) |
| `fetchedAt` | string \| null | 서버가 응답을 조립한 시각 (ISO 8601). 실제 외부 fetch 성공 시각과 다를 수 있음 |
| `cachedAt` | string \| null | 애플리케이션에서 확인할 수 있는 캐시 저장 시각. 현재는 항상 `null` |
| `stale` | boolean | stale fallback 여부. 현재 stale fallback을 구현하지 않아 `false` |
| `partial` | boolean | 일부 소스 실패로 부분 성공 여부 |
| `warnings` | string[] | 사용자에게 표시할 경고 메시지 목록 |

## source 값 정책

| 값 | 설명 |
|---|---|
| `mock` | `LOSTARK_API_KEY` 미설정 시 in-memory mock 데이터 반환 |
| `lostark-openapi` | 실제 LostArk Open API 호출 성공 |
| `memory` | in-memory saved store 조회/쓰기 |
| `fallback` | 실데이터 소스 미연동 또는 캐시 없음 시 mock/샘플 데이터로 대체 |
| `unknown` | 출처 미확인 (서버 내부 오류 등) |

## 엔드포인트

### 조회 (GET)
- `GET /api/home` — 홈 데이터 (공지/추천 콘텐츠)
- `GET /api/character/:name` — 캐릭터 스펙 상세
- `GET /api/expedition/:name` — 원정대 통합 (캐릭터 목록 + ROI 카드)
- `GET /api/weekly/:name` — 주간 체크리스트 + roiFollowups
- `GET /api/saved` — 저장 목록(pinned 우선→lastSeenAt 최신순) + 변경 추적 이벤트

#### GET /api/character/:name 에러 코드

| 코드 | HTTP | 설명 |
|---|---|---|
| `INVALID_NAME` | 400 | 이름 파라미터 비어 있음 |
| `CHARACTER_NOT_FOUND` | 404 | 프로필 upstream 404 또는 필수 프로필 데이터가 null |
| `AUTH_INVALID_KEY` | 401 | API 키가 잘못되었거나 만료됨 |
| `RATE_LIMITED` | 429 | upstream 요청 한도 초과 |
| `UPSTREAM_UNAVAILABLE` | 502 | upstream 5xx 또는 네트워크 실패 |

partial=true 케이스: 장비/보석/각인/원정대 목록 중 일부 실패 시 `warnings`에 상세 항목 포함.

#### GET /api/expedition/:name 에러 코드

| 코드 | HTTP | 설명 |
|---|---|---|
| `INVALID_NAME` | 400 | 이름 파라미터 비어 있음 |
| `EXPEDITION_NOT_FOUND` | 404 | 원정대 캐릭터 목록 upstream 404 또는 필수 목록이 null/empty |
| `AUTH_INVALID_KEY` | 401 | API 키가 잘못되었거나 만료됨 |
| `RATE_LIMITED` | 429 | upstream 요청 한도 초과 |
| `UPSTREAM_UNAVAILABLE` | 502 | upstream 5xx 또는 네트워크 실패 |

partial=true 케이스: 대표 캐릭터 상세 조회 실패 시 `topCharacter=null`로 반환하고 `warnings` 포함.

#### GET /api/weekly/:name 에러 코드

| 코드 | HTTP | 설명 |
|---|---|---|
| `INVALID_NAME` | 400 | 이름 파라미터 비어 있음 |
| `WEEKLY_NOT_FOUND` | 404 | 원정대 캐릭터 목록 upstream 404 또는 필수 목록이 null/empty |
| `AUTH_INVALID_KEY` | 401 | API 키가 잘못되었거나 만료됨 |
| `RATE_LIMITED` | 429 | upstream 요청 한도 초과 |
| `UPSTREAM_UNAVAILABLE` | 502 | upstream 5xx 또는 네트워크 실패 |

#### API 키 정책

| 상황 | 동작 |
|---|---|
| `LOSTARK_API_KEY` 미설정 | `IS_MOCK_MODE=true` → mock 데이터 반환, `source: ["mock"]` |
| `LOSTARK_API_KEY` 잘못됨 | LostArk API 401 → `LostArkAuthError` throw → `AUTH_INVALID_KEY` 401 반환 |
| upstream 404 또는 필수 데이터 null | route별 `*_NOT_FOUND` 404 반환 |
| upstream 429 | `RATE_LIMITED` 429 반환 |
| upstream 5xx/network | `UPSTREAM_UNAVAILABLE` 502 반환 |
| 선택 데이터 일부 실패 | HTTP 200, `partial: true`, `warnings` 배열에 항목 포함 |

### 주간 초기화 기준

`weeklyResetAt`은 서버 OS 시간대와 무관하게 `Asia/Seoul` 기준 매주 수요일 06:00을 사용한다.

- 수요일 05:59 KST: 당일 06:00 KST
- 수요일 06:00 KST 이상: 다음 주 수요일 06:00 KST

### 저장 쓰기 (Write)

#### `POST /api/saved`
저장 항목 생성.

**요청 Body:**
```json
{
  "type": "character" | "expedition" | "query",
  "key": "캐릭터명 또는 원정대명",
  "label": "표시 이름",
  "pinned": false,   // optional, default: false
  "tags": []         // optional, default: []
}
```

**응답 (201 Created / 200 이미 존재):**
```json
{
  "success": true,
  "data": { "item": { ...SavedItem } },
  "warnings": ["이미 저장된 항목입니다. lastSeenAt이 갱신되었습니다."]
}
```

**에러 코드:**
| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_BODY` | 400 | 필수 필드 누락 또는 타입 오류 |
| `INVALID_TYPE` | 400 | type 값이 허용 범위 밖 |
| `SAVED_CREATE_ERROR` | 500 | 서버 내부 오류 |

---

#### `PATCH /api/saved/:id`
저장 항목 수정 (pinned, tags, label).

**요청 Body (모두 선택):**
```json
{
  "pinned": true,
  "tags": ["tag1", "tag2"],
  "label": "새 표시 이름"
}
```

**응답 (200 OK):**
```json
{
  "success": true,
  "data": { "item": { ...SavedItem } }
}
```

**에러 코드:**
| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_BODY` | 400 | 필드 타입 오류 또는 수정 필드(pinned/tags/label) 하나도 없음 |
| `SAVED_NOT_FOUND` | 404 | 해당 id 항목 없음 |
| `SAVED_PATCH_ERROR` | 500 | 서버 내부 오류 |

---

#### `DELETE /api/saved/:id`
저장 항목 + 연관 변경 이벤트 삭제.

**응답 (200 OK):**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

**에러 코드:**
| 코드 | HTTP | 설명 |
|------|------|------|
| `SAVED_NOT_FOUND` | 404 | 해당 id 항목 없음 |
| `SAVED_DELETE_ERROR` | 500 | 서버 내부 오류 |

---

## SavedItem 스키마
```ts
{
  id: string;
  type: "character" | "expedition" | "query";
  key: string;
  label: string;
  pinned: boolean;
  tags: string[];
  lastSeenAt: string | null;
}
```

## 저장소 정책 (MVP)
- **인증 없음** — 단일 사용자 로컬 정책
- **in-memory** — 서버 프로세스 재시작 시 초기화 (TODO: DB 연동 후 교체)
- **최대 50개** — 초과 시 lastSeenAt 오래된 항목 자동 제거
- **정렬** — pinned 우선 → lastSeenAt 최신순
