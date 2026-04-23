# API Schema

## 공통 메타 필드
- success
- source
- fetchedAt
- cachedAt
- stale
- partial
- warnings

## 엔드포인트
- `GET /api/home` — 홈 데이터 (공지/추천 콘텐츠)
- `GET /api/character/:name` — 캐릭터 스펙 상세
- `GET /api/expedition/:name` — 원정대 통합 (캐릭터 목록 + ROI 카드)
- `GET /api/weekly/:name` — 주간 체크리스트
- `GET /api/saved` — 저장 목록 + 변경 추적 이벤트
