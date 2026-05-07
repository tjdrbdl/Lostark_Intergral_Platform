# API Schema

## 공통 메타 필드
| 필드 | 타입 | 설명 |
|------|------|------|
| `success` | boolean | 요청 성공 여부 |
| `source` | string[] | 데이터 소스 목록 (`mock`, `lostark-api`, `memory`, `fallback` 등) |
| `fetchedAt` | string \| null | 데이터 취득 시각 (ISO 8601) |
| `cachedAt` | string \| null | 캐시 저장 시각 |
| `stale` | boolean | 캐시 만료 여부 |
| `partial` | boolean | 일부 소스 실패로 부분 성공 여부 |
| `warnings` | string[] | 사용자에게 표시할 경고 메시지 목록 |

## 엔드포인트

### 조회 (GET)
- `GET /api/home` — 홈 데이터 (공지/추천 콘텐츠)
- `GET /api/character/:name` — 캐릭터 스펙 상세
- `GET /api/expedition/:name` — 원정대 통합 (캐릭터 목록 + ROI 카드)
- `GET /api/weekly/:name` — 주간 체크리스트 + roiFollowups
- `GET /api/saved` — 저장 목록(pinned 우선→lastSeenAt 최신순) + 변경 추적 이벤트

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
| `INVALID_BODY` | 400 | 필드 타입 오류 |
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
